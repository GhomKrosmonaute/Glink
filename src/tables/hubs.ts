import * as app from "../app.js"

export interface Hub {
  channelId: string
  networkId: number
  inviteLink?: string
}

/**
 * Represent a hub linked on Discord channel.
 */
const table = new app.Table<Hub>({
  name: "hubs",
  setup: (table) => {
    table.string("channelId").unique()
    table
      .integer("networkId")
      .index()
      .references("id")
      .inTable("networks")
      .onDelete("CASCADE")
    table.string("inviteLink").nullable()
  },
})

export default table
