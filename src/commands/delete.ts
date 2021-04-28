import * as app from "../app"

const command: app.Command = {
  name: "delete",
  aliases: ["del", "rm", "remove"],
  description: "Delete a network message",
  middlewares: [app.hubOnly],
  coolDown: 5000,
  positional: [
    {
      name: "target",
      description: "The resolvable message",
      castValue: "message",
      required: true,
    },
  ],
  async run(message) {
    message.triggerCoolDown()

    await message.delete()

    return app.deleteMessage(message.args.target, message.author.id)
  },
}

module.exports = command