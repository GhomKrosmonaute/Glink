import * as app from "#app"

import mutesData, { Mute } from "#tables/mutes.ts"
import networks, { Network } from "#tables/networks.ts"

export default new app.Command({
  name: "mute",
  description: "Mute an user from own network",
  channelType: "all",
  middlewares: [app.networkOwnerOnly],
  positional: [
    {
      name: "user",
      type: "user",
      description: "The user to mute",
      required: true,
    },
  ],
  options: [
    {
      name: "reason",
      type: "string",
      description: "Reason of mute",
      aliases: ["m", "message"],
    },
  ],
  async run(message) {
    const network = (await networks.query
      .select()
      .where("ownerId", message.author.id)
      .first()) as Network

    const mute: Mute = {
      networkId: network.id,
      userId: message.args.user.id,
      reason: message.args.reason ?? undefined,
      date: Date.now(),
    }

    mutesData.query.insert(mute)

    return message.channel.send(
      `You have successfully muted **${message.args.user.username}** from the "**${network.displayName}**" network.`,
    )
  },
  subs: [
    new app.Command({
      name: "list",
      description: "List muted users",
      channelType: "all",
      aliases: ["ls"],
      middlewares: [app.networkOwnerOnly],
      async run(message) {
        const network = (await networks.query
          .select()
          .where("ownerId", message.author.id)
          .first()) as Network
        const mutes = await mutesData.query
          .select()
          .where("networkId", network.id)

        new app.StaticPaginator({
          pages: app.divider(mutes, 10).map((page) => ({
            embeds: [
              new app.EmbedBuilder()
                .setTitle("Muted list - " + network.displayName)
                .setDescription(
                  page
                    .map((mute) => {
                      return `\`${app
                        .dayjs(mute.date)
                        .format("DD/MM/YY HH:mm")}\` - **${mute.userId}** - ${
                        mute.reason ?? "undefined reason"
                      }`
                    })
                    .join("\n"),
                ),
            ],
          })),
          channel: message.channel,
          filter: (reaction, user) => user.id === message.author.id,
        })
      },
    }),
  ],
})
