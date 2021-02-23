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

    app.muted.set(user.id, {
      networkId: message.author.id,
      reason: message.args.reason ?? undefined,
      date: Date.now(),
    })

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
            Array.from(
              app.muted
                .filter((muted) => {
                  return muted.networkId === message.author.id
                })
                .entries()
            ),
            10
          ).map((page) =>
            new app.MessageEmbed()
              .setTitle(
                "Muted list - " +
                  app.networks.get(message.author.id)?.displayName
              )
              .setDescription(
                page
                  .map(([id, muted]) => {
                    return `\`${app
                      .dayjs(muted.date)
                      .format("DD/MM/YY HH:mm")}\` - **${id}** - ${
                      muted.reason ?? "undefined reason"
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
