import * as app from "../app"

const command: app.Command = {
  name: "teardown",
  networkOwner: true,
  aliases: ["down", "abort", "clean", "delete", "remove", "reset"],
  async run(message) {
    app.removeNetwork.bind(message.client)(message.author.id)

    return message.channel.send(
      `You have successfully removed the "**${
        app.networks.get(message.author.id)?.displayName
      }**" network.`
    )
  },
}

module.exports = command
