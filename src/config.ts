import * as app from "./app.js"

export const config: app.Config = {
  ignoreBots: true,
  async getPrefix(message) {
    return app.prefix(message.guild ?? undefined)
  },
  client: {
    intents: [
      "MessageContent", // olala quel débile je suis
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
