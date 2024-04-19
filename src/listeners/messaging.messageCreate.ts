import * as app from "../app.js"

import hubs from "../tables/hubs.js"
import mutes from "../tables/mutes.js"

const listener: app.Listener<"messageCreate"> = {
  event: "messageCreate",
  description: "Handle network message",
  async run(message) {
    if (!message.author.bot) {
      if (!app.isNormalMessage(message)) return

      const prefix = await app.prefix(message.guild ?? undefined)
      const botMention = new RegExp(`^<@!?${message.client.user?.id}> ?`)

      if (
        message.content.startsWith(prefix) ||
        botMention.test(message.content)
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

        await app.sendHubMessageToHubs(message, networkHubs, hub.inviteLink)
      }
      return
    }
  },
}

export default listener
