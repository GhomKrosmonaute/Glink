import * as app from "../app"

const command: app.Command = {
  name: "leave",
  guildOwner: true,
  description: "Leave e network, remove virtual",
  async run(message) {
    // todo: code here
    await message.reply("leave command is not yet implemented.")
  },
}

module.exports = command
