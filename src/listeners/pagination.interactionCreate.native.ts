// system file, please don't modify it

import * as app from "../app.js"

const listener: app.Listener<"interactionCreate"> = {
  event: "interactionCreate",
  description: "Handle interactions for pagination",
  async run(interaction) {
    if (
      interaction.isButton() &&
      interaction.customId.startsWith("pagination-")
    ) {
      const paginator = app.Paginator.getByMessage(interaction.message)

      if (paginator) return paginator.handleInteraction(interaction)

      await interaction.deferUpdate()
    }
  },
}

export default listener
