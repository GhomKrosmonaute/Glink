import * as app from "../app"

import mutesData, { Mute } from "../tables/mutes"
import networks, { Network } from "../tables/networks"

const command: app.Command = {
  name: "mute",
  description: "Mute an user from own network",
  middlewares: [app.networkOwnerOnly],
  positional: [
    {
      name: "user",
      description: "The user to mute",
      castValue: "user",
      required: true,
    },
  ],
  options: [
    {
      name: "reason",
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
      `You have successfully muted **${message.args.user.username}** from the "**${network.displayName}**" network.`
    )
  },
  subs: [
    {
      name: "list",
      aliases: ["ls"],
      description: "List muted users",
      middlewares: [app.networkOwnerOnly],
      async run(message) {
        const network = (await networks.query
          .select()
          .where("ownerId", message.author.id)
          .first()) as Network
        const mutes = await mutesData.query
          .select()
          .where("networkId", network.id)

        new app.Paginator(
          app.Paginator.divider(mutes, 10).map((page) =>
            new app.MessageEmbed()
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
                  .join("\n")
              )
          ),
          message.channel,
          (reaction, user) => user.id === message.author.id
        )
      },
    },
  ],
}

module.exports = command
