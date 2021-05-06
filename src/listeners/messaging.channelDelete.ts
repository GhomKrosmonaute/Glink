import * as app from "../app"

import hubs from "../tables/hubs"

const listener: app.Listener<"channelDelete"> = {
  event: "channelDelete",
  async run(channel) {
    await hubs.query.delete().where("channelId", channel.id)
  },
}

module.exports = listener
