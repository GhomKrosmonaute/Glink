import * as app from "../app"

import networks, { Network } from "../tables/networks"
import hubs from "../tables/hubs"

const command: app.Command = {
  name: "hubs",
  description: "List owned hubs",
  aliases: ["hub", "net"],
  middlewares: [app.networkOwnerOnly],
  async run(message) {
    const network = (await networks.query
      .select()
      .where("ownerId", message.author.id)
      .first()) as Network
    return message.channel.send(
      new app.MessageEmbed()
        .setTitle(`Hub list - ${network.displayName}`)
        .setDescription(
          (await app.getNetworkHubs(network.id))
            .map((hub) => {
              const guildName =
                (
                  message.client.channels.cache.get(
                    hub.channelId
                  ) as app.GuildChannel
                )?.guild.name ?? "not a guild channel"
              return `\`${hub.channelId}\` ${
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
          name: "channel",
          description: "The hub to remove",
          castValue: "channel",
          required: true,
        },
      ],
      middlewares: [app.networkOwnerOnly],
      async run(message) {
        const { id } = message.args.channel

        const hub = await hubs.query.select().where("channelId", id).first()
        const network = (await networks.query
          .select()
          .where("ownerId", message.author.id)
          .first()) as Network

        if (!hub) return message.channel.send("The given hub id is incorrect.")
        if (hub.networkId !== network.id)
          return message.channel.send(
            "The targeted hub does not belong to you."
          )

        await app.removeHub.bind(message.client)(
          id,
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
