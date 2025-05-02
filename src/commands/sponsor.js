import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { db } from "../db/client.js";
import { ROLE_GROUPS, ROLES } from "../config/roles.js";
import { logIncident } from "../utils/logger.js";

export const data = new SlashCommandBuilder()
  .setName("sponsor")
  .setDescription("Sponsor a Patron for promotion to Regular")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("The user to sponsor")
      .setRequired(true)
  );

export async function execute(interaction) {
  const sponsorId = interaction.user.id;
  const targetUser = interaction.options.getUser("user");

  // Prevent self-sponsorship
  if (sponsorId === targetUser.id) {
    return interaction.reply({
      content: "❌ You can’t sponsor yourself.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const sponsorMember = await interaction.guild.members.fetch(sponsorId);
  const isEligible = sponsorMember.roles.cache.some((r) =>
    ROLE_GROUPS.CAN_SPONSOR.includes(r.id)
  );

  if (!isEligible) {
    return interaction.reply({
      content: "❌ You must be a trusted member to sponsor someone.",
      flags: MessageFlags.Ephemeral,
    });
  }

  // Record sponsorship
  await db.sponsor.create({
    data: {
      userId: targetUser.id,
      sponsoredBy: sponsorId,
    },
  });

  // Promote the user: remove Patron, add Regular
  const targetMember = await interaction.guild.members.fetch(targetUser.id);
  const hadPatron = targetMember.roles.cache.has(ROLES.PATRONS);

  try {
    if (hadPatron) {
      await targetMember.roles.remove(ROLES.PATRONS);
    }

    await targetMember.roles.add(ROLES.REGULARS);
  } catch (err) {
    console.error("❌ Role update failed:", err);
    return interaction.reply({
      content: `⚠️ Sponsor recorded, but failed to update roles for ${targetUser.username}.`,
      flags: MessageFlags.Ephemeral,
    });
  }

  await logIncident(
    `<@${targetUser.id}> has been sponsored by <@${sponsorMember.id}> and promoted to <@&${ROLES.REGULARS}>.`
  );
  return interaction.reply({
    content: `🎉 You sponsored **${targetUser.username}** and they have been promoted to **Regulars**!`,
    flags: MessageFlags.Ephemeral,
  });
}
