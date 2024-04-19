import * as app from "../app.js"
import * as Url from "url"
import ss from "string-similarity"

import hubsData, { Hub } from "../tables/hubs.js"
import networksData, { Network } from "../tables/networks.js"
import discord from "discord.js"

export const hubOnly: app.Middleware<"all"> = async (message, data) => {
  return {
    result:
      !!(await hubsData.query
        .select()
        .where("channelId", message.channel.id)
        .first()) || "You must use this command in a hub.",
    data,
  }
}

export const networkOwnerOnly: app.Middleware<"all"> = async (
  message,
  data,
) => {
  return {
    result:
      !!(await networksData.query
        .select()
        .where("ownerId", message.author.id)
        .first()) || "You must have setup a network.",
    data,
  }
}

export async function sendTextToHubs(
  client: app.Client,
  message: string | { embeds: app.EmbedBuilder[] },
  hubs: Hub[],
) {
  const channels: app.Channel[] = []

  for (const hub of hubs) {
    try {
      const channel = await client.channels.fetch(hub.channelId)
      if (channel) channels.push(channel)
      else throw new Error()
    } catch (error) {
      await hubsData.query.delete().where("channelId", hub.channelId)
    }
  }

  return Promise.all(
    channels.map((channel) => {
      if (channel.isTextBased()) return channel.send(message)
    }),
  )
}

export async function sendHubMessageToHubs(
  message: app.Message,
  hubs: Hub[],
  inviteLink?: string,
): Promise<unknown> {
  const channels: app.Channel[] = []

  for (const hub of hubs) {
    try {
      const channel = await message.client.channels.fetch(hub.channelId)
      if (channel) channels.push(channel)
      else throw new Error()
    } catch (error) {
      await hubsData.query.delete().where("channelId", hub.channelId)
    }
  }

  const embed = glinkEmbedFrom(message, inviteLink)

  try {
    await message.delete()
  } catch (error) {
    return Promise.all(
      channels.map((channel) => {
        if (channel.isTextBased() && channel.id !== message.channel.id)
          return channel.send({ embeds: [embed] })
      }),
    )
  }

  return Promise.all(
    channels.map((channel) => {
      if (channel.isTextBased()) return channel.send({ embeds: [embed] })
    }),
  )
}

export interface EmbedParams {
  id: app.Snowflake
  authorId: app.Snowflake
}

export function extractEmbedParams(href: string): EmbedParams {
  const url = new Url.URL(href)
  return {
    id: url.searchParams.get("id") as string,
    authorId: url.searchParams.get("author") as string,
  }
}

export function compileEmbedParams(params: Omit<EmbedParams, "id">): string {
  const url = new Url.URL("https://embed.data")
  url.searchParams.append("id", app.SnowflakeUtil.generate().toString())
  url.searchParams.append("authorId", params.authorId)
  return url.href
}

export async function deleteMessage(
  target: app.Message,
  actionAuthorId: app.Snowflake,
): Promise<unknown> {
  if (target.embeds.length === 0 || !target.embeds[0].url)
    return target.channel.send("Please target a valid chat message.")

  const targetParams = app.extractEmbedParams(target.embeds[0].url)
  const hub = await hubsData.query
    .select()
    .where("channelId", target.channel.id)
    .first()

  if (!hub) return target.channel.send("This channel is not a hub.")

  const network = await networksData.query
    .select()
    .where("id", hub.networkId)
    .first()

  if (!network)
    return removeHub.bind(target.client)(
      hub.channelId,
      "The network of this hub has been deleted.",
    )

  if (
    actionAuthorId !== network.ownerId &&
    actionAuthorId !== targetParams.authorId &&
    !target.member?.permissions.has("ManageMessages", true)
  )
    return target.channel.send("You don't have permission for this action.")

  const hubs = await getNetworkHubs(network.id)

  for (const hub of hubs) {
    let channel
    try {
      channel = await target.client.channels.fetch(hub.channelId)
      if (!channel) throw new Error()
    } catch (error) {
      return removeHub.bind(target.client)(hub.channelId)
    }

    if (channel.isTextBased()) {
      const messages = await channel.messages.fetch()

      const message = messages.find((message) => {
        if (message.embeds.length === 0 || !message.embeds[0].url) return false

        const embedParams = app.extractEmbedParams(message.embeds[0].url)

        return targetParams.id === embedParams.id
      })

      if (message) await message.delete().catch()
    }
  }
}

function glinkEmbedFrom(
  message: app.Message & { client: app.Client<true> },
  inviteLink?: string,
): app.EmbedBuilder {
  const embed = new app.EmbedBuilder()
    .setDescription(message.content)
    .setURL(
      compileEmbedParams({
        authorId: message.author.id,
      }),
    )
    .setColor(message.member?.displayHexColor ?? "Blurple")
    .setAuthor({
      name: message.author.username,
      iconURL: message.author.displayAvatarURL(),
      url: inviteLink,
    })
    .setFooter({
      text: message.guild?.name || "Unknown guild name",
      iconURL:
        message.guild?.iconURL() ?? message.client.user.displayAvatarURL(),
    })
    .setTimestamp()

  function findEmojiAndAttachIt(emoji: Pick<discord.Emoji, "id" | "animated">) {
    if (attachImage(getEmojiURL(emoji))) {
      message.content = ""
    }
  }

  /**
   * Return emoji URL or nothing
   */
  function getEmojiURL({
    id,
    animated,
  }: Pick<discord.Emoji, "id" | "animated">): string {
    return `https://cdn.discordapp.com/emojis/${id}.${animated ? "gif" : "png"}`
  }

  function attachImage(url: string): boolean {
    if (!embed.data.image) {
      embed.setImage(url)
    } else if (!embed.data.thumbnail) {
      embed.setThumbnail(url)
    } else {
      return false
    }
    return true
  }

  for (const word of message.content.split(/\s+/)) {
    if (/^https?:\/\//i.test(word)) {
      const url = new Url.URL(word)
      url.search = ""
      if (/\.(?:png|gif|jpe?g)$/i.test(url.href)) {
        message.content = message.content.replace(word, "").trim()
        attachImage(url.href)
      }
    }
  }

  if (message.attachments.size > 0) {
    for (const [, attachment] of message.attachments) {
      const url = new Url.URL(attachment.url)
      url.search = ""
      if (/\.(?:png|gif|jpe?g)$/i.test(url.href)) attachImage(url.href)
    }
  }

  {
    const match = /^<(a)?:[a-z-_]+:(\d+)>$/i.exec(message.content)

    if (match) {
      const [, animated, id] = match
      findEmojiAndAttachIt({ animated: !!animated, id })
    }
  }

  message.content = message.content.replace(
    /^<(a)?:[a-z-_]+:(\d+)>$/gi,
    (full, animated, id) => {
      return getEmojiURL({ animated: !!animated, id })
    },
  )

  if (message.content) embed.setDescription(message.content)

  return embed
}

export async function getNetworkHubs(networkId: number) {
  return hubsData.query
    .select()
    .where("networkId", networkId)
    .then((r) => r)
}

export async function removeNetwork(this: app.Client, ownerId: app.Snowflake) {
  const network = await networksData.query
    .select()
    .where("ownerId", ownerId)
    .first()

  if (!network) return

  const reason = `The "**${network.displayName}**" network was removed.`

  const hubs = await getNetworkHubs(network.id)

  for (const hub of hubs) {
    await removeHub.bind(this)(hub.channelId, reason)
  }

  await networksData.query.delete().where("id", network.id)
}

export async function removeHub(
  this: app.Client,
  channelId: app.Snowflake,
  reason?: string,
) {
  await hubsData.query.delete().where("channelId", channelId)

  const channel = this.channels.cache.get(channelId)

  if (reason && channel && channel.isTextBased()) channel.send(reason).catch()
}
