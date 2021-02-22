import { URL } from "url"
import * as app from "../app"

const command: app.Command = {
  name: "join",
  description: "Join a network, make current channel as hub",
  guildOwner: true,
  positional: [
    {
      name: "networkId",
      checkValue: (value) => app.networks.has(value),
      required: true,
    },
  ],
  args: [
    {
      name: "inviteLink",
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
      checkValue: /.{5,64}/,
    },
  ],
  async run(message) {
    const hub: app.Hub = {
      networkId: message.positional.networkId,
      inviteLink: message.args.inviteLink ?? undefined,
    }

    if (app.getNetworkHubs(hub.networkId).length > 9)
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
