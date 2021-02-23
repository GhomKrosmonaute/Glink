import * as app from "../app"

const listener: app.Listener<"guildMemberRemove"> = {
  event: "guildMemberRemove",
  async run(member) {
    if (
      !member.client.guilds.cache.some((guild) =>
        guild.members.cache.has(member.id)
      )
    ) {
      app.removeNetwork(member.id)
    }
  },
}

module.exports = listener
