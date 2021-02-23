import * as app from "../app"

const command: app.Command = {
  name: "teardown",
  aliases: ["down", "abort", "clean", "delete", "remove", "reset"],
  async run(message) {
    const network = app.networks.get(message.author.id)

    if (!network) return message.channel.send(`You don't have setup a network.`)

    app.removeNetwork.bind(message.client)(message.author.id)

    return message.channel.send(
      `You have successfully removed the "**${network.displayName}**" network.`
    )
  },
}

module.exports = command
