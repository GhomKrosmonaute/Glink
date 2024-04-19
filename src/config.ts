import * as app from "./app.js"

export const config: app.Config = {
  ignoreBots: true,
  async getPrefix(message) {
    return message.guild
      ? await app.prefix(message.guild)
      : process.env.BOT_PREFIX!
  },
  client: {
    intents: [
      "Guilds",
      "GuildMembers",
      "GuildBans",
      "GuildEmojisAndStickers",
      "GuildIntegrations",
      "GuildWebhooks",
      "GuildInvites",
      "GuildVoiceStates",
      "GuildPresences",
      "GuildMessages",
      "GuildMessageReactions",
      "GuildMessageTyping",
      "DirectMessages",
      "DirectMessageReactions",
      "DirectMessageTyping",
    ],
  },
}
