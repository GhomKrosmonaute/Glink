import * as app from "../app.js"

export interface Hub {
  channelId: string
  networkId: number
  inviteLink?: string
}

const table = new app.Table<Hub>({
  name: "hubs",
  description: "Represent a hub linked on Discord channel",
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
