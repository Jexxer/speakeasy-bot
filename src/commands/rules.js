// src/commands/rules.js
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { GUILD } from "../config/constants.js";

export const data = new SlashCommandBuilder()
  .setName("rules")
  .setDescription("Post the house rules to the channel.")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("Optional: tag a user as a reminder")
      .setRequired(false)
  );

export async function execute(interaction) {
  const targetUser = interaction.options.getUser("user");

  const embed = new EmbedBuilder()
    .setTitle(`🏛️ House Rules (<#${GUILD.CHANNELS.HOUSE_RULES_ID}>)`)
    .setColor("DarkRed")
    .setDescription(
      `Welcome to the Speakeasy. Respect the lounge and your fellow patrons.\n\n` +
        `**🔇 Be Respectful**\n` +
        `No hate speech, slurs, or harassment. We keep it civil here.\n\n` +
        `**🗣️ Keep It Chill**\n` +
        `Debate is welcome. Drama is not.\n\n` +
        `**🔞 NSFW**\n` +
        `Only in <#${GUILD.CHANNELS.NSFW_ID}>. No illegal or abusive content.\n\n` +
        `**📛 No Spam**\n` +
        `No tagging abuse, flooding messages, or unsolicited promos.\n\n` +
        `**📜 Discord ToS**\n` +
        `[Follow Discord's Terms of Service](https://discord.com/terms)\n\n` +
        `*Violations can result in kicks or bans. Stay classy.*`
    );

  const mention = targetUser
    ? `<@${targetUser.id}>, just a friendly reminder:`
    : null;

  await interaction.reply({
    content: mention ?? null,
    embeds: [embed],
    allowedMentions: { users: targetUser ? [targetUser.id] : [] },
  });
}
