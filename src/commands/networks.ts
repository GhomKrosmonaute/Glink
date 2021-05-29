import * as app from "../app"

import { URL } from "url"

import networks, { Network } from "../tables/networks"
import hubs, { Hub } from "../tables/hubs"

module.exports = new app.Command({
  name: "networks",
  description: "Networks manager",
  channelType: "all",
  aliases: ["nw", "works"],
  async run(message) {
    return message.channel.send(
      "Type `" +
        (await app.prefix(message.guild ?? undefined)) +
        "help networks` for usage detail."
    )
  },
  subs: [
    new app.Command({
      name: "list",
      description: "List networks",
      aliases: ["ls", "all"],
      channelType: "all",
      async run(message) {
        new app.Paginator({
          pages: await Promise.all(
            app.Paginator.divider(await networks.query.select(), 10).map(
              async (page) => {
                return new app.MessageEmbed()
                  .setTitle("Networks list")
                  .setDescription(
                    (
                      await Promise.all(
                        page.map(async (network) => {
                          const networkUsers = new Set(
                            (await app.getNetworkHubs(network.id))
                              .map((hub) => {
                                const channel =
                                  message.client.channels.cache.get(
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
                      )
                    ).join("\n")
                  )
              }
            )
          ),
          channel: message.channel,
          filter: (reaction, user) => user.id === message.author.id,
        })
      },
    }),
    new app.Command({
      name: "setup",
      description: "Setup a new network",
      aliases: ["set", "add", "create", "new"],
      channelType: "all",
      positional: [
        {
          name: "name",
          description: "The own network name",
          required: true,
          checkValue: /.{3,50}/,
        },
      ],
      options: [
        {
          name: "password",
          description: "The own network password",
          aliases: ["pass", "pw"],
          checkValue: /.{5,64}/,
        },
      ],
      async run(message) {
        await networks.query
          .insert({
            ownerId: message.author.id,
            password: message.args.password,
            displayName: message.args.name,
          })
          .onConflict("ownerId")
          .merge()

        return message.channel.send(
          `The "**${message.args.name}**" network successful created. \`ID:${message.author.id}\``
        )
      },
    }),
    new app.Command({
      name: "remove",
      description: "Kill your network",
      channelType: "all",
      aliases: [
        "down",
        "abort",
        "clean",
        "delete",
        "teardown",
        "rm",
        "reset",
        "del",
      ],
      positional: [
        {
          name: "networkId",
          description: "The network to remove",
          default: (message) => message?.author.id ?? "no default",
        },
      ],
      async run(message) {
        const network = await networks.query
          .select()
          .where("ownerId", message.args.networkId)
          .first()

        if (!network)
          return message.channel.send("Oops, this network do not exists.")

        if (
          network.ownerId !== message.author.id &&
          message.author.id !== process.env.BOT_OWNER
        )
          return message.channel.send(
            `Oops, the **${network.displayName}** network does not belong to you.`
          )

        await app.removeNetwork.bind(message.client)(message.author.id)

        return message.channel.send(
          `You have successfully removed the "**${network.displayName}**" network and hubs.`
        )
      },
    }),
    new app.Command({
      name: "join",
      description: "Join a network, make current channel as hub",
      channelType: "guild",
      guildOwnerOnly: true,
      positional: [
        {
          name: "networkId",
          description: "The network to join",
          required: true,
        },
      ],
      options: [
        {
          name: "inviteLink",
          description: "Joined guild url",
          aliases: ["invite", "link", "l", "invitation", "url"],
          checkValue: (value) => {
            try {
              const url = new URL(value)
              return url.hostname === "discord.gg"
            } catch (error) {
              return false
            }
          },
        },
        {
          name: "password",
          description: "The joined network password",
          checkValue: /.{5,64}/,
          aliases: ["pass", "pw"],
        },
      ],
      async run(message) {
        const network = await networks.query
          .select()
          .where("ownerId", message.args.networkId)
          .first()

        if (!network) return message.channel.send("This network don't exists.")

        if ((await app.getNetworkHubs(network.id)).length > 9)
          return message.channel.send(
            "This network has too many hubs... (max 10)"
          )

        if (network.password && network.password !== message.args.password)
          return message.channel.send(`Incorrect password!`)

        const hub: Hub = {
          channelId: message.channel.id,
          networkId: network.id,
          inviteLink: message.args.inviteLink ?? undefined,
        }

        await hubs.query.insert(hub)

        return message.channel.send(
          `You have successfully joined the "**${network.displayName}**" network`
        )
      },
    }),
  ],
})
