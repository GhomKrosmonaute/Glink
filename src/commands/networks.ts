import * as app from "../app"

const command: app.Command = {
  name: "networks",
  description: "Networks manager",
  aliases: ["nw", "works"],
  async run(message) {
    return message.channel.send(
      "Type `" +
        (await app.prefix(message.guild ?? undefined)) +
        "help networks` for usage detail."
    )
  },
  subs: [
    {
      name: "list",
      description: "List networks",
      async run(message) {
        new app.Paginator(
          app.Paginator.divider([...app.networks.entries()], 10).map((page) => {
            return new app.MessageEmbed()
              .setTitle("Networks list")
              .setDescription(
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
                    } 👤 ] - owner: ${message.client.users.cache.get(
                      networkId
                    )}`
                  })
                  .join("\n")
              )
          }),
          message.channel,
          (reaction, user) => user.id === message.author.id
        )
      },
    },
    {
      name: "remove",
      botOwnerOnly: true,
      description: "Remove a network",
      async run(message) {
        return message.channel.send("not yet implemented.")
      },
    },
  ],
}

module.exports = command
