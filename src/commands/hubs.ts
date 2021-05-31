import * as app from "../app"

import networks, { Network } from "../tables/networks"
import hubs from "../tables/hubs"

module.exports = new app.Command({
  name: "hubs",
  description: "List owned hubs",
  aliases: ["hub", "net"],
  channelType: "all",
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
    new app.Command({
      name: "remove",
      description: "Remove a owned hub",
      aliases: ["rm", "exit", "quit", "leave", "del", "delete"],
      channelType: "all",
      positional: [
        {
          name: "channel",
          description: "The hub to remove",
          castValue: "channel",
          default: (message) => message?.channel.toString() ?? "no channel",
        },
      ],
      async run(message) {
        const { id } = message.args.channel

        const hub = await hubs.query.select().where("channelId", id).first()

        if (!hub) return message.channel.send("The given hub id is incorrect.")

        if (message.author.id === process.env.BOT_OWNER) {
          await app.removeHub.bind(message.client)(
            id,
            `This hub was removed by the bot owner.`
          )

          return message.channel.send(
            "The targeted hub was successfully removed."
          )
        }

        const network = await networks.query
          .select()
          .where("ownerId", message.author.id)
          .first()

        if (!network)
          return message.channel.send("You must have setup a network!")

        const guildOwner = message.author.id === message.guild?.id
        const networkOwner = hub.networkId === network.id

        if (!networkOwner && !guildOwner)
          return message.channel.send(
            "The targeted hub does not belong to you."
          )

        await app.removeHub.bind(message.client)(
          id,
          `This hub was removed by the "**${
            guildOwner ? message.guild?.name : network.displayName
          }**" owner.`
        )

        return message.channel.send(
          "The targeted hub was successfully removed."
        )
      },
    }),
  ],
})
