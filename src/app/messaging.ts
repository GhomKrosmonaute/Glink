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
  return app.hubs.filterArray((hub) => {
    return hub.networkId === networkId
  })
}
