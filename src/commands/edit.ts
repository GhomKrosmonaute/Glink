import * as app from "../app"

const command: app.Command = {
  name: "edit",
  description: "Edit hub message",
  async run(message) {
    // todo: code here
    await message.reply("edit command is not yet implemented.")
  },
}

module.exports = command
