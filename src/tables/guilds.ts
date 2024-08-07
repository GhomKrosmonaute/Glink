import * as app from "#app"

export interface Guild {
  id: string
  prefix: string
}

/**
 * Represent a guild
 */
export default new app.Table<Guild>({
  name: "guilds",
  setup: (table) => {
    table.string("id").unique()
    table.string("prefix").nullable()
  },
})
