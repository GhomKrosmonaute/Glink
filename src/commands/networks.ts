import * as app from "#app"

import { URL } from "url"

import networks from "#tables/networks.ts"
import hubs, { Hub } from "#tables/hubs.ts"

export default new app.Command({
  name: "networks",
  description: "Networks manager",
  channelType: "all",
  aliases: ["nw", "works"],
  async run(message) {
    return message.channel.send(
      "Type `" +
        (await app.prefix(message.guild ?? undefined)) +
        "help networks` for usage detail.",
    )
  },
  subs: [
    new app.Command({
      name: "list",
      description: "List networks",
      aliases: ["ls", "all"],
      channelType: "all",
      async run(message) {
        new app.StaticPaginator({
          pages: await Promise.all(
            app.divider(await networks.query.select(), 10).map(async (page) => {
              return {
                embeds: [
                  new app.EmbedBuilder()
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
                                      hub.channelId,
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
                                .flat(),
                            )

                            return `\`${app.forceTextSize(
                              network.displayName,
                              20,
                              true,
                            )}\` - [ ${
                              networkUsers.size
                            } 👤 ] - owner: ${message.client.users.cache.get(
                              network.ownerId,
                            )}`
                          }),
                        )
                      ).join("\n"),
                    ),
                ],
              }
            }),
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
          type: "string",
          description: "The own network name",
          required: true,
          validate: /.{3,50}/.test,
        },
      ],
      options: [
        {
          name: "password",
          type: "string",
          description: "The own network password",
          aliases: ["pass", "pw"],
          validate: /.{5,64}/.test,
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
          `The "**${message.args.name}**" network successful created. \`ID:${message.author.id}\``,
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
          type: "string",
          description: "The network to remove",
          default: (message: app.Message) => message?.author.id ?? "no default",
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
            `Oops, the **${network.displayName}** network does not belong to you.`,
          )

        await app.removeNetwork.bind(message.client)(message.author.id)

        return message.channel.send(
          `You have successfully removed the "**${network.displayName}**" network and hubs.`,
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
          type: "string",
          description: "The network to join",
          required: true,
        },
      ],
      options: [
        {
          name: "inviteLink",
          type: "string",
          description: "Joined guild url",
          aliases: ["invite", "link", "l", "invitation", "url"],
          validate: (value: string) => {
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
          type: "string",
          description: "The joined network password",
          validate: /.{5,64}/.test,
          aliases: ["pass", "pw"],
        },
        {
          name: "channel",
          type: "channel",
          description: "The channel that join network",
          default: (message: app.Message) => message?.channel.id ?? "",
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
            "This network has too many hubs... (max 10)",
          )

        if (
          network.ownerId !== message.author.id &&
          network.password &&
          network.password !== message.args.password
        )
          return message.channel.send(`Incorrect password!`)

        const hub: Hub = {
          channelId: message.args.channel.id,
          networkId: network.id,
          inviteLink: message.args.inviteLink ?? undefined,
        }

        await hubs.query.insert(hub).onConflict("channelId").merge()

        const hubList = await hubs.query
          .where({ networkId: network.id })
          .andWhereNot({
            channelId: message.args.channel.id,
          })

        const channel = message.args.channel as app.GuildChannel

        await app.sendTextToHubs(
          message.client,
          {
            embeds: [
              new app.EmbedBuilder()
                .setTitle(`"${channel.guild.name}" joined us!`)
                .setURL(
                  message.args.inviteLink ??
                    "https://media.discordapp.net/attachments/609313381421154304/939238186180288572/yellowbar.png",
                )
                .setImage(
                  channel.guild.iconURL() ??
                    "https://media.discordapp.net/attachments/609313381421154304/939238186180288572/yellowbar.png",
                ),
            ],
          },
          hubList,
        )

        return message.channel.send(
          `You have successfully joined the "**${network.displayName}**" network`,
        )
      },
    }),
  ],
})
