import { URL } from "url"
import * as app from "../app"

import networks from "../tables/networks"
import hubs, { Hub } from "../tables/hubs"

const command: app.Command = {
  name: "join",
  description: "Join a network, make current channel as hub",
  guildChannelOnly: true,
  guildOwnerOnly: true,
  positional: [
    {
      name: "networkOwnerId",
      description: "The resolvable network to join",
      required: true,
    },
  ],
  options: [
    {
      name: "inviteLink",
      description: "Joined guild url",
      aliases: ["invite", "link", "l", "invitation", "url"],
      checkValue: (value) => {
        try {
          const url = new URL(value)
          return url.hostname === "discord.gg"
        } catch (error) {
          return false
        }
      },
    },
    {
      name: "password",
      description: "The joined network password",
      checkValue: /.{5,64}/,
      aliases: ["pass", "pw"],
    },
  ],
  async run(message) {
    const network = await networks.query
      .select()
      .where("ownerId", message.args.networkOwnerId)
      .first()

    if (!network) return message.channel.send("This network don't exists.")

    if ((await app.getNetworkHubs(network.id)).length > 9)
      return message.channel.send("This network has too many hubs... (max 10)")

    if (network.password && network.password !== message.args.password)
      return message.channel.send(`Incorrect password!`)

    const hub: Hub = {
      channelId: message.channel.id,
      networkId: network.id,
      inviteLink: message.args.inviteLink ?? undefined,
    }

    await hubs.query.insert(hub)

    return message.channel.send(
      `You have successfully joined the "**${network.displayName}**" network`
    )
  },
}

module.exports = command
