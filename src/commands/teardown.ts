import * as app from "../app"

import networks, { Network } from "../tables/networks"

const command: app.Command = {
  name: "teardown",
  description: "Kill your own network",
  middlewares: [app.networkOwnerOnly],
  aliases: ["down", "abort", "clean", "delete", "remove", "reset"],
  async run(message) {
    const network = (await networks.query
      .select()
      .where("ownerId", message.author.id)
      .first()) as Network

    await app.removeNetwork.bind(message.client)(message.author.id)

    return message.channel.send(
      `You have successfully removed the "**${network.displayName}**" network and hubs.`
    )
  },
}

module.exports = command
