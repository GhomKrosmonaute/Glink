import * as app from "#app"

export default new app.Command({
  name: "invite",
  description: "Get invite link of Glink",
  channelType: "all",
  async run(message) {
    return message.channel.send({
      embeds: [
        new app.EmbedBuilder()
          .setColor("Blurple")
          .setTitle("My invite link")
          .setDescription(
            "[View permissions](https://discordapi.com/permissions.html#388176)",
          )
          .setURL(
            message.client.generateInvite({
              scopes: [app.OAuth2Scopes.Bot],
              permissions: 388176n,
            }),
          ),
      ],
    })
  },
})
