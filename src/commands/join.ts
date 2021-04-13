import { URL } from "url"
import * as app from "../app"

const command: app.Command = {
  name: "join",
  description: "Join a network, make current channel as hub",
  guildOwnerOnly: true,
  positional: [
    {
      name: "networkId",
      description: "The resolvable network to join",
      checkValue: (value) => app.networks.has(value),
      required: true,
    },
  ],
  options: [
    {
      name: "inviteLink",
      description: "Joined guild url",
      aliases: ["invite", "link", "l", "invitation"],
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
    const hub: app.Hub = {
      networkId: message.args.networkId,
      inviteLink: message.args.inviteLink ?? undefined,
    }

    if (app.getNetworkHubs(hub.networkId).size > 9)
      return message.channel.send("This network has too many hubs... (max 10)")

    const network = app.networks.get(hub.networkId)

    if (network?.password && network.password !== message.args.password)
      return message.channel.send(`Incorrect password!`)

    app.hubs.set(message.channel.id, hub)

    return message.channel.send(
      `You have successfully joined the "**${network?.displayName}**" network`
    )
  },
}

module.exports = command
