import * as app from "../app"

module.exports = new app.Command({
  name: "leave",
  aliases: ["exit", "quit"],
  channelType: "all",
  guildOwnerOnly: true,
  middlewares: [app.hubOnly],
  description: "Leave a network, remove hub",
  async run(message) {
    return app.removeHub.bind(message.client)(
      message.channel.id,
      "You have successfully deleted this hub."
    )
  },
})
