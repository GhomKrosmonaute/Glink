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
}

module.exports = command
