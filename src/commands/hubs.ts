import * as app from "../app"

const command: app.Command = {
  name: "hubs",
  description: "List owned hubs",
  aliases: ["hub", "net"],
  middlewares: [app.networkOwnerOnly],
  async run(message) {
    const network = app.networks.get(message.author.id) as app.Network
    return message.channel.send(
      new app.MessageEmbed()
        .setTitle(`Hub list - ${network.displayName}`)
        .setDescription(
          app
            .getNetworkHubs(message.author.id)
            .map((hub, id) => {
              const guildName =
                (message.client.channels.cache.get(id) as app.GuildChannel)
                  ?.guild.name ?? "not a guild channel"
              return `\`${id}\` ${
                hub.inviteLink ? `[${guildName}](${hub.inviteLink})` : guildName
              }`
            })
            .join("\n")
        )
    )
  },
  subs: [
    {
      name: "remove",
      description: "Remove a owned hub",
      aliases: ["rm"],
      positional: [
        {
          name: "hub",
          description: "The hub to remove",
          castValue: "channel",
          required: true,
        },
      ],
      middlewares: [app.networkOwnerOnly],
      async run(message) {
        const { id: hubId } = message.args.channel

        const hub = app.hubs.get(hubId)
        const network = app.networks.get(message.author.id) as app.Network

        if (!hub) return message.channel.send("The given hub id is incorrect.")
        if (hub.networkId !== message.author.id)
          return message.channel.send(
            "The targeted hub does not belong to you."
          )

        app.removeHub.bind(message.client)(
          hubId,
          `This hub was removed by the "**${network.displayName}**" owner.`
        )

        return message.channel.send(
          "The targeted hub was successfully removed."
        )
      },
    },
  ],
}

module.exports = command
