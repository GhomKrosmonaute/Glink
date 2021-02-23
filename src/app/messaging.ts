import * as app from "../app"
import Enmap from "enmap"

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

  await Promise.all(
    channels.map((channel) => {
      if (channel.isText())
        return channel.send(glinkEmbedFrom(message, inviteLink))
    })
  )

  return message.delete()
}

function glinkEmbedFrom(
  message: app.Message,
  inviteLink?: string
): app.MessageEmbed {
  return new app.MessageEmbed()
    .setColor(message.member?.displayHexColor ?? "BLURPLE")
    .setAuthor(
      message.author.username,
      message.author.displayAvatarURL({
        dynamic: true,
      }),
      inviteLink
    )
    .setDescription(message.content)
    .setFooter(
      message.guild?.name,
      message.guild?.iconURL({ dynamic: true }) ??
        message.client.user?.displayAvatarURL({ dynamic: true })
    )
    .setTimestamp()
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
    removeHub.bind(this)(hub, id, reason)
  })
  app.networks.delete(networkId)
}

export function removeHub(
  this: app.Client,
  hub: app.Hub,
  channelId: app.Snowflake,
  reason: string
) {
  app.hubs.delete(channelId)

  const channel = this.channels.cache.get(channelId)

  if (channel && channel.isText()) channel.send(reason).catch()
}
