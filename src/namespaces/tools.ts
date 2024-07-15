import Discord from "discord.js"

import guilds from "#tables/guilds.ts"

export async function prefix(guild?: Discord.Guild): Promise<string> {
  const prefix = process.env.BOT_PREFIX as string
  if (guild) {
    const guildData = await guilds.query
      .where("id", guild.id)
      .select("prefix")
      .first()
    if (guildData) {
      return guildData.prefix ?? prefix
    }
  }
  return prefix
}
