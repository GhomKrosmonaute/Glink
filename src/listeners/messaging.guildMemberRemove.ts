import * as app from "#app"

const listener: app.Listener<"guildMemberRemove"> = {
  event: "guildMemberRemove",
  description: "Remove own network on member remove",
  async run(member) {
    if (
      !member.client.guilds.cache.some((guild) =>
        guild.members.cache.has(member.id),
      )
    ) {
      await app.removeNetwork.bind(member.client)(member.id)
    }
  },
}

export default listener
