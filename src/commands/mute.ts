import * as app from "../app"

const command: app.Command = {
  name: "mute",
  description: "Mute an user from own network",
  middlewares: [app.networkOwnerOnly],
  positional: [
    {
      name: "user",
      description: "The use to mute",
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
    const mutes = app.mutes.ensure(message.author.id, [])

    app.mutes.set(message.author.id, [
      ...mutes,
      {
        userId: message.args.user.id,
        reason: message.args.reason ?? undefined,
        date: Date.now(),
      },
    ])

    return message.channel.send(
      `You have successfully muted **${
        message.args.user.username
      }** from the "**${
        app.networks.get(message.author.id)?.displayName
      }**" network.`
    )
  },
  subs: [
    {
      name: "list",
      aliases: ["ls"],
      description: "List muted users",
      middlewares: [app.networkOwnerOnly],
      async run(message) {
        new app.Paginator(
          app.Paginator.divider(
            app.mutes.ensure(message.author.id, []),
            10
          ).map((page) =>
            new app.MessageEmbed()
              .setTitle(
                "Muted list - " +
                  app.networks.get(message.author.id)?.displayName
              )
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
