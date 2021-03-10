import * as app from "../app"

const command: app.Command = {
  name: "delete",
  aliases: ["del", "rm", "remove"],
  description: "Delete a network message",
  hubOnly: true,
  coolDown: 5000,
  positional: [
    {
      name: "messageId",
      required: true,
    },
  ],
  async run(message) {
    await message.delete()

    try {
      const target = await message.channel.messages.fetch(
        message.positional.messageId
      )

      return app.deleteMessage(target, message.author.id)
    } catch (error) {
      return message.channel.send("Unknown message.")
    }
  },
}

module.exports = command
