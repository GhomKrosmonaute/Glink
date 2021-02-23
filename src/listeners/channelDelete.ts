import * as app from "../app"

const listener: app.Listener<"channelDelete"> = {
  event: "channelDelete",
  async run(channel) {
    app.hubs.delete(channel.id)
  },
}

module.exports = listener
