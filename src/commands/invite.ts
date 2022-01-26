import * as app from "../app.js"

export default new app.Command({
  name: "invite",
  description: "Get invite link of Glink",
  channelType: "all",
  async run(message) {
    return message.channel.send({
      embeds: [
        new app.MessageEmbed()
          .setColor("BLURPLE")
          .setTitle("My invite link")
          .setDescription(
            "[View permissions](https://discordapi.com/permissions.html#388176)"
          )
          .setURL(
            message.client.generateInvite({
              scopes: ["bot"],
              permissions: new app.Permissions(388176n),
            })
          ),
      ],
    })
  },
})
