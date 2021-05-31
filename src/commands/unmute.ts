import * as app from "../app"

import networks, { Network } from "../tables/networks"
import mutesData from "../tables/mutes"

module.exports = new app.Command({
  name: "unmute",
  description: "Unmute an user from own network",
  middlewares: [app.networkOwnerOnly],
  positional: [
    {
      name: "user",
      description: "The use to mute",
      castValue: "user",
      required: true,
    },
  ],
  async run(message) {
    const network = (await networks.query
      .select()
      .where("ownerId", message.author.id)
      .first()) as Network
    const mute = await mutesData.query
      .select()
      .where("networkId", network.id)
      .and.where("userId", message.args.user.id)
      .first()

    if (!mute)
      return message.channel.send(
        `**${message.args.user.username}** is not muted.`
      )

    await mutesData.query
      .delete()
      .where("networkId", network.id)
      .and.where("userId", message.args.user.id)

    return message.channel.send(
      `You have successfully un-muted **${message.args.user.username}** from the "**${network.displayName}**" network.`
    )
  },
})
