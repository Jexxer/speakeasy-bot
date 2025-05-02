import { MessageFlags } from "discord.js";

export const name = "interactionCreate";

export async function execute(interaction) {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Error running /${interaction.commandName}:`, error);
    await interaction.reply({
      content: "There was an error executing that command.",
      flags: MessageFlags.Ephemeral,
    });
  }
}
