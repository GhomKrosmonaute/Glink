import * as app from "../app"

const command: app.Command = {
  name: "setup",
  description: "Setup a new network",
  guildOwner: true,
  positional: [
    {
      name: "name",
      required: true,
      checkValue: /.{3,50}/,
    },
  ],
  args: [
    {
      name: "password",
      aliases: ["pass", "pw"],
      checkValue: /.{5,64}/,
    },
  ],
  async run(message) {
    const network: app.Network = {
      password: message.args.password,
      displayName: message.positional.name,
    }

    app.networks.set(message.author.id, network)

    return message.channel.send(
      `The "**${network.displayName}**" network successful created.`
    )
  },
}

module.exports = command
