import * as app from "../app"

const command: app.Command = {
  name: "unmute",
  description: "Unmute an user from own network",
  middlewares: [app.networkOwnerOnly],
  positional: [
    {
      name: "user",
      description: "The use to mute",
      castValue: "user",
      required: true,
    },
  ],
  async run(message) {
    const mutes = app.mutes.ensure(message.author.id, [])
    const mute = mutes.find((mute) => mute.userId === message.args.user.id)

    if (!mute)
      return message.channel.send(
        `**${message.args.user.username}** is not muted.`
      )

    mutes.splice(mutes.indexOf(mute), 1)

    app.mutes.set(message.author.id, mutes)

    return message.channel.send(
      `You have successfully un-muted **${
        message.args.user.username
      }** from the "**${
        app.networks.get(message.author.id)?.displayName
      }**" network.`
    )
  },
}

module.exports = command
