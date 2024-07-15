import { Config } from "#src/app/config.ts"
import { z } from "zod"

export const config = new Config({
  ignoreBots: true,
  async getPrefix(message) {
    return import("#src/namespaces/tools.ts").then((tools) =>
      tools.prefix(message.guild ?? undefined),
    )
  },
  envSchema: z.object({}),
  client: {
    intents: [
      "MessageContent",
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
})

export default config.options
