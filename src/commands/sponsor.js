import { SlashCommandBuilder } from "discord.js";
import { db } from "../db/client.js";
import { ROLE_GROUPS } from "../config/roles.js";

export const data = new SlashCommandBuilder()
  .setName("sponsor")
  .setDescription("Sponsor a Patron for promotion consideration")
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
      ephemeral: true,
    });
  }

  const member = await interaction.guild.members.fetch(sponsorId);
  const isEligible = member.roles.cache.some((r) =>
    ROLE_GROUPS.CAN_SPONSOR.includes(r.id)
  );

  if (!isEligible) {
    return interaction.reply({
      content: "❌ You must be a trusted member to sponsor someone.",
      ephemeral: true,
    });
  }

  // Check if sponsor already exists
  const existing = await db.Sponsor.findFirst({
    where: {
      userId: targetUser.id,
      sponsoredBy: sponsorId,
    },
  });

  if (existing) {
    return interaction.reply({
      content: `❌ You've already sponsored ${targetUser.username}.`,
      ephemeral: true,
    });
  }

  // Record sponsorship
  await db.sponsor.create({
    data: {
      userId: targetUser.id,
      sponsoredBy: sponsorId,
    },
  });

  // Count all sponsors
  const sponsorCount = await db.sponsor.count({
    where: {
      userId: targetUser.id,
    },
  });

  return interaction.reply({
    content: `📝 You sponsored **${
      targetUser.username
    }**. They now have **${sponsorCount} sponsor${
      sponsorCount === 1 ? "" : "s"
    }**.`,
    ephemeral: true,
  });
}
