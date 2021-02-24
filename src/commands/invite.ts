import * as app from "../app"

const command: app.Command = {
  name: "invite",
  async run(message) {
    return message.channel.send(
      new app.MessageEmbed()
        .setColor("BLURPLE")
        .setTitle("My invite link")
        .setDescription(
          "[View permissions](https://discordapi.com/permissions.html#388176)"
        )
        .setURL(
          await message.client.generateInvite({
            permissions: 388176,
          })
        )
    )
  },
}

module.exports = command
