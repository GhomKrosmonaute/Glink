import * as app from "#app"

import hubs from "#tables/hubs.ts"

const listener: app.Listener<"channelDelete"> = {
  event: "channelDelete",
  description: "Delete hub on channel deleted",
  async run(channel) {
    await hubs.query.delete().where("channelId", channel.id)
  },
}

export default listener
