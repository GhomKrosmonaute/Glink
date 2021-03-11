import * as app from "../app"

const command: app.Command = {
  name: "networks",
  aliases: ["nw", "works"],
  async run(message) {
    new app.Paginator(
      app.Paginator.divider([...app.networks.entries()], 10).map((page) => {
        return new app.MessageEmbed().setTitle("Networks list").setDescription(
          page
            .map(([networkId, network]) => {
              const networkUsers = new Set(
                app
                  .getNetworkHubs(networkId)
                  .map((hub, hubId) => {
                    const channel = message.client.channels.cache.get(
                      hubId
                    ) as app.GuildChannel
                    return channel.guild.members.cache
                      .filter(({ user }) => !user.bot)
                      .map((member) => member.id)
                  })
                  .flat()
              )

              return `\`${app.resizeText(
                network.displayName,
                20,
                true
              )}\` - [ ${
                networkUsers.size
              } 👤 ] - owner: ${message.client.users.cache.get(networkId)}`
            })
            .join("\n")
        )
      }),
      message.channel,
      (reaction, user) => user.id === message.author.id
    )
  },
  subs: [
    {
      name: "remove",
      botOwner: true,
      async run(message) {},
    },
  ],
}

module.exports = command
