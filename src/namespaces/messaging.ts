import * as app from "../app"
import * as Url from "url"
import ss from "string-similarity"

import hubsData, { Hub } from "../tables/hubs"
import networksData, { Network } from "../tables/networks"

export const hubOnly: app.Middleware<app.CommandMessage> = async (message) => {
  return (
    !!(await hubsData.query
      .select()
      .where("channelId", message.channel.id)
      .first()) || "You must use this command in a hub."
  )
}

export const networkOwnerOnly: app.Middleware<app.CommandMessage> = async (
  message
) => {
  return (
    !!(await networksData.query
      .select()
      .where("ownerId", message.author.id)
      .first()) || "You must have setup a network."
  )
}

export async function sendToHubs(
  message: app.Message,
  hubs: Hub[],
  inviteLink?: string
): Promise<unknown> {
  const channels: app.Channel[] = []

  for (const hub of hubs) {
    try {
      const channel = await message.client.channels.fetch(hub.channelId)
      channels.push(channel)
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
        if (channel.isText() && channel.id !== message.channel.id)
          return channel.send(embed)
      })
    )
  }

  return Promise.all(
    channels.map((channel) => {
      if (channel.isText()) return channel.send(embed)
    })
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
  url.searchParams.append("id", app.SnowflakeUtil.generate())
  url.searchParams.append("authorId", params.authorId)
  return url.href
}

export async function deleteMessage(
  target: app.Message,
  actionAuthorId: app.Snowflake
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
      "The network of this hub has been deleted."
    )

  if (
    actionAuthorId !== network.ownerId &&
    actionAuthorId !== targetParams.authorId
  )
    return target.channel.send("You don't have permission for this action.")

  const hubs = await getNetworkHubs(network.id)

  for (const hub of hubs) {
    let channel
    try {
      channel = await target.client.channels.fetch(hub.channelId)
    } catch (error) {
      return removeHub.bind(target.client)(hub.channelId)
    }

    if (channel.isText()) {
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
  message: app.Message,
  inviteLink?: string
): app.MessageEmbed {
  const embed = new app.MessageEmbed()
    .setURL(
      compileEmbedParams({
        authorId: message.author.id,
      })
    )
    .setColor(message.member?.displayHexColor ?? "BLURPLE")
    .setAuthor(
      message.author.username,
      message.author.displayAvatarURL({
        dynamic: true,
      }),
      inviteLink
    )
    .setFooter(
      message.guild?.name,
      message.guild?.iconURL({ dynamic: true }) ??
        message.client.user?.displayAvatarURL({ dynamic: true })
    )
    .setTimestamp()

  function findEmojiAndAttachIt(name: string) {
    const emoji = findEmoji(name)
    if (emoji) {
      if (attachImage(emoji.url)) {
        message.content = ""
      }
    }
  }

  function findEmoji(name: string): app.GuildEmoji | undefined {
    const emojis = message.client.emojis.cache.array()
    const { bestMatchIndex } = ss.findBestMatch(
      name.toLowerCase(),
      emojis.map((emoji) => emoji.name.toLowerCase())
    )
    return emojis[bestMatchIndex]
  }

  function attachImage(url: string): boolean {
    if (!embed.image) {
      embed.setImage(url)
    } else if (!embed.thumbnail) {
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
    const match = /^<a?:([a-z-_]+):(\d+)>$/i.exec(message.content)

    if (match) {
      const emoji = message.client.emojis.resolve(match[2])
      if (emoji) {
        if (attachImage(emoji.url)) {
          message.content = ""
        }
      } else {
        findEmojiAndAttachIt(match[1])
      }
    }
  }

  {
    const match = /^:(\S+):$/.exec(message.content)

    if (match) findEmojiAndAttachIt(match[1])
  }

  message.content = message.content
    .split(" ")
    .map((word) => {
      const match = /^:(\S+):$/.exec(word)
      if (match) {
        const emoji = findEmoji(match[1])
        if (emoji) return emoji.url
      }
      return word
    })
    .join(" ")

  if (message.content) embed.setDescription(message.content)

  return embed
}

export function getNetworkHubs(networkId: number) {
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
  reason?: string
) {
  await hubsData.query.delete().where("channelId", channelId)

  const channel = this.channels.cache.get(channelId)

  if (reason && channel && channel.isText()) channel.send(reason).catch()
}
