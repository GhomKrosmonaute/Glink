import * as app from "../app"

const command: app.Command = {
  name: "unmute",
  networkOwner: true,
  positional: [
    {
      name: "userId",
      required: true,
    },
  ],
  async run(message) {
    const user = message.client.users.cache.get(message.positional.userId)

    if (!user) return message.channel.send("This user do not exists.")

    const mutes = app.mutes.ensure(message.author.id, [])
    const mute = mutes.find((mute) => mute.userId === user.id)

    if (!mute) return message.channel.send(`**${user.username}** is not muted.`)

    mutes.splice(mutes.indexOf(mute), 1)

    app.mutes.set(message.author.id, mutes)

    return message.channel.send(
      `You have successfully un-muted **${user.username}** from the "**${
        app.networks.get(message.author.id)?.displayName
      }**" network.`
    )
  },
}

module.exports = command
