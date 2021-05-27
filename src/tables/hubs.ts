import * as app from "../app"

export interface Hub {
  channelId: string
  networkId: number
  inviteLink?: string
}

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
