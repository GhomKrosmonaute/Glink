import * as app from "../app"

const command: app.Command = {
  name: "setup",
  description: "Setup a new network",
  guildOwnerOnly: true,
  positional: [
    {
      name: "name",
      description: "The own network name",
      required: true,
      checkValue: /.{3,50}/,
    },
  ],
  options: [
    {
      name: "password",
      description: "The own network password",
      aliases: ["pass", "pw"],
      checkValue: /.{5,64}/,
    },
  ],
  async run(message) {
    const network: app.Network = {
      password: message.args.password,
      displayName: message.args.name,
    }

    app.networks.set(message.author.id, network)

    return message.channel.send(
      `The "**${network.displayName}**" network successful created. \`ID:${message.author.id}\``
    )
  },
}

module.exports = command
