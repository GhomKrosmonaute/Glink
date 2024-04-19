import * as app from "../app.js"

export default new app.Command({
  name: "delete",
  aliases: ["del", "rm", "remove"],
  description: "Delete a network message",
  channelType: "all",
  middlewares: [app.hubOnly],
  cooldown: {
    type: app.CooldownType.Global,
    duration: 5000,
  },
  positional: [
    {
      name: "target",
      type: "message",
      description: "The resolvable message",
      required: true,
    },
  ],
  async run(message) {
    message.triggerCoolDown()

    await message.delete()

    return app.deleteMessage(message.args.target, message.author.id)
  },
})
