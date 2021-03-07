import * as app from "../app"

const command: app.Command = {
  name: "mute",
  networkOwner: true,
  positional: [
    {
      name: "userId",
      required: true,
    },
  ],
  args: [
    {
      name: "reason",
      aliases: ["m", "message"],
    },
  ],
  async run(message) {
    const user = message.client.users.cache.get(message.positional.userId)

    if (!user) return message.channel.send("This user do not exists.")

    const mutes = app.mutes.ensure(message.author.id, [])

    app.mutes.set(message.author.id, [
      ...mutes,
      {
        userId: user.id,
        reason: message.args.reason ?? undefined,
        date: Date.now(),
      },
    ])

    return message.channel.send(
      `You have successfully muted **${user.username}** from the "**${
        app.networks.get(message.author.id)?.displayName
      }**" network.`
    )
  },
  subs: [
    {
      name: "list",
      aliases: ["ls"],
      networkOwner: true,
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
