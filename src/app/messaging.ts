import * as app from "../app"
import Enmap from "enmap"
import ss from "string-similarity"
import * as Url from "url"

export async function sendToHubs(
  message: app.Message,
  hubs: Enmap<string, app.Hub>,
  inviteLink?: string
) {
  const channels = await Promise.all(
    hubs.map((hub, channelId) => {
      return message.client.channels.fetch(channelId)
    })
  )

  const embed = glinkEmbedFrom(message, inviteLink)

  await Promise.all(
    channels.map((channel) => {
      if (channel.isText()) return channel.send(embed)
    })
  )

  return message.delete()
}

function glinkEmbedFrom(
  message: app.Message,
  inviteLink?: string
): app.MessageEmbed {
  const embed = new app.MessageEmbed()
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
    const { bestMatchIndex, bestMatch } = ss.findBestMatch(
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

export function getNetworkHubs(networkId: app.Snowflake) {
  return app.hubs.filter((hub) => {
    return hub.networkId === networkId
  })
}

export function removeNetwork(this: app.Client, networkId: app.Snowflake) {
  const network = app.networks.get(networkId)

  if (!network) return

  const reason = `The "**${network.displayName}**" network was removed.`

  getNetworkHubs(networkId).forEach((hub, id) => {
    removeHub.bind(this)(id, reason)
  })
  app.networks.delete(networkId)
}

export function removeHub(
  this: app.Client,
  hubId: app.Snowflake,
  reason: string
) {
  app.hubs.delete(hubId)

  const channel = this.channels.cache.get(hubId)

  if (channel && channel.isText()) channel.send(reason).catch()
}
