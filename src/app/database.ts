import Discord from "discord.js"
import Enmap from "enmap"

//# Exemple with Enmap:

/** Enmap<Guild, Prefix> */
export const prefixes = new Enmap<Discord.Snowflake, string>({
  name: "prefixes",
})

/**
 * Enmap<User, Network>
 */
export const networks = new Enmap<Discord.Snowflake, Network>({
  name: "networks",
})

/**
 * Enmap<Channel, Hub>
 */
export const hubs = new Enmap<Discord.Snowflake, Hub>({
  name: "hubs",
})

export const muted = new Enmap<Discord.Snowflake, Muted>({
  name: "muted",
})

export interface Network {
  password?: string
  displayName: string
}

export interface Hub {
  networkId: Discord.Snowflake
  inviteLink?: string
}

export interface Muted {
  networkId: Discord.Snowflake
  reason?: string
  date: number
}

// Docs: https://enmap.evie.dev/
