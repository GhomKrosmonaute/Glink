import * as app from "../app"

const command: app.Command = {
  name: "hubs",

  async run(message) {
    // todo: code here
    await message.reply("hubs command is not yet implemented.")
  },
}

module.exports = command
