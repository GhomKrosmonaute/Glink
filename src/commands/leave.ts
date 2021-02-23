import * as app from "../app"

const command: app.Command = {
  name: "leave",
  guildOwner: true,
  description: "Leave e network, remove virtual",
  async run(message) {
    const hub = app.hubs.get(message.channel.id)

    if (!hub) return message.channel.send("This channel is not a hub.")

    app.removeHub.bind(message.client)(
      message.channel.id,
      "You have successfully deleted this hub."
    )
  },
}

module.exports = command
