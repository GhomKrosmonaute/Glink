import * as app from "../app"

module.exports = new app.Command({
  name: "invite",
  description: "Get invite link of Glink",
  channelType: "all",
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
})
