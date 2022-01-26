import * as app from "../app.js"

export interface Network {
  id: number
  ownerId: string
  password?: string
  displayName: string
}

const table = new app.Table<Network>({
  name: "networks",
  description: "Represent a network linked on Discord user",
  priority: 10,
  setup: (table) => {
    table.increments("id").primary().unsigned()
    table.string("ownerId").unique()
    table.string("password").nullable()
    table.string("displayName", 64)
  },
})

export default table
