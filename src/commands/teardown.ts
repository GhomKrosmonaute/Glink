import * as app from "../app"

const command: app.Command = {
  name: "teardown",
  networkOwner: true,
  aliases: ["down", "abort", "clean", "delete", "remove", "reset"],
  async run(message) {
    const network = app.networks.get(message.author.id) as app.Network

    app.removeNetwork.bind(message.client)(message.author.id)

    return message.channel.send(
      `You have successfully removed the "**${network.displayName}**" network.`
    )
  },
}

module.exports = command
