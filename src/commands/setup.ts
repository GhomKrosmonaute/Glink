import * as app from "../app"

import networks from "../tables/networks"

const command: app.Command = {
  name: "setup",
  description: "Setup a new network",
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
    await networks.query
      .insert({
        ownerId: message.author.id,
        password: message.args.password,
        displayName: message.args.name,
      })
      .onConflict("ownerId")
      .merge()

    return message.channel.send(
      `The "**${message.args.name}**" network successful created. \`ID:${message.author.id}\``
    )
  },
}

module.exports = command
