import * as app from "../app"

import networks from "../tables/networks"

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
      aliases: ["ls"],
      description: "List networks",
      async run(message) {
        new app.Paginator(
          await Promise.all(
            app.Paginator.divider(await networks.query.select(), 10).map(
              async (page) => {
                return new app.MessageEmbed()
                  .setTitle("Networks list")
                  .setDescription(
                    await Promise.all(
                      page
                        .map(async (network) => {
                          const networkUsers = new Set(
                            (await app.getNetworkHubs(network.id))
                              .map((hub) => {
                                const channel = message.client.channels.cache.get(
                                  hub.channelId
                                )
                                if (
                                  !channel ||
                                  !(channel instanceof app.GuildChannel)
                                )
                                  return []
                                return channel.guild.members.cache
                                  .filter(({ user }) => !user.bot)
                                  .map((member) => member.id)
                              })
                              .flat()
                          )

                          return `\`${app.forceTextSize(
                            network.displayName,
                            20,
                            true
                          )}\` - [ ${
                            networkUsers.size
                          } 👤 ] - owner: ${message.client.users.cache.get(
                            network.ownerId
                          )}`
                        })
                        .join("\n")
                    )
                  )
              }
            )
          ),
          message.channel,
          (reaction, user) => user.id === message.author.id
        )
      },
    },
    {
      name: "remove",
      botOwnerOnly: true,
      description: "Remove a network",
      aliases: ["rm", "delete", "del"],
      async run(message) {
        return message.channel.send("not yet implemented.")
      },
    },
  ],
}

module.exports = command
