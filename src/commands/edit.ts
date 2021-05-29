import * as app from "../app"

module.exports = new app.Command({
  name: "edit",
  description: "Edit hub message",
  channelType: "guild",
  async run(message) {
    // todo: code here
    await message.reply("edit command is not yet implemented.")
  },
})
