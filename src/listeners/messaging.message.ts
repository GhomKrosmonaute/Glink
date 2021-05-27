import * as app from "../app"
import hubs from "../tables/hubs"
import mutes from "../tables/mutes"

const listener: app.Listener<"message"> = {
  event: "message",
  async run(message) {
    if (!message.author.bot) {
      if (!app.isCommandMessage(message)) return

      const prefix = await app.prefix(message.guild ?? undefined)
      const mentionRegex = new RegExp(`^<@!?${message.client.user?.id}> ?`)

      if (
        message.content.startsWith(prefix) ||
        mentionRegex.test(message.content)
      )
        return

      const hub = await hubs.query
        .select()
        .where("channelId", message.channel.id)
        .first()
      if (hub) {
        const networkMutes = await mutes.query
          .select()
          .where("networkId", hub.networkId)

        if (networkMutes.some((mute) => mute.userId === message.author.id))
          return message.delete()

        const networkHubs = await hubs.query
          .select()
          .where("networkId", hub.networkId)

        await app.sendToHubs(message, networkHubs, hub.inviteLink)
      }
      return
    }
  },
}

module.exports = listener
