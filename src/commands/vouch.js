import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { MessageFlags } from "discord.js";
import { db } from "../db/client.js";
import { ROLES, ROLE_GROUPS } from "../config/roles.js";
import { COOLDOWNS } from "../config/constants.js";
import { vouchCooldowns } from "../config/cache.js";
import { logIncident } from "../utils/logger.js";

export const data = new SlashCommandBuilder()
  .setName("vouch")
  .setDescription("Vouch for a user to grant them access.")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("The user you want to vouch for")
      .setRequired(true)
  );

export async function execute(interaction) {
  const voucher = interaction.member;
  const voucherDisplayName =
    interaction.member?.displayName || interaction.author.username;
  const voucherId = interaction.user.id;

  // Check permission (do they have any vouch-allowed role?)
  const canVouch = ROLE_GROUPS.CAN_VOUCH.some((roleId) =>
    voucher.roles.cache.has(roleId)
  );

  if (!canVouch) {
    return interaction.reply({
      content: "🚫 You don't have permission to vouch.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const target = interaction.options.getUser("user");
  const guildMember = await interaction.guild.members.fetch(target.id);

  // Prevent vouching for someone who already has the role
  if (guildMember.roles.cache.has(ROLES.PATRONS)) {
    return interaction.reply({
      content: `${target.username} already has the ${
        interaction.guild.roles.cache.get(ROLES.PATRONS)?.name
      } role.`,
      flags: MessageFlags.Ephemeral,
    });
  }

  // Prevent vouching for users who are already vouched or higher
  const hasTrustedRole = ROLE_GROUPS.ALREADY_VOUCHED_OR_HIGHER.some((roleId) =>
    guildMember.roles.cache.has(roleId)
  );

  if (hasTrustedRole) {
    return interaction.reply({
      content: `${target.username} is already vouched for or has a higher role.`,
      flags: MessageFlags.Ephemeral,
    });
  }

  // Cooldown logic
  const now = Date.now();
  const lastVouch = vouchCooldowns.get(voucherId);

  if (lastVouch && now - lastVouch < COOLDOWNS.VOUCH_MS) {
    const timeLeft = Math.ceil((COOLDOWNS.VOUCH_MS - (now - lastVouch)) / 1000);
    return interaction.reply({
      content: `⏳ You need to wait ${timeLeft} more seconds before vouching again.`,
      flags: MessageFlags.Ephemeral,
    });
  }

  // Update cooldown
  vouchCooldowns.set(voucherId, now);

  // Add role to user
  await guildMember.roles.add(ROLES.PATRONS, `Vouched by ${voucher.user.tag}`);
  await logIncident(
    `<@${target.id}> has been vouched for by <@${voucher.id}> and promoted to <@&${ROLES.PATRONS}>.`
  );

  // Log to DB
  await db.vouch.create({
    data: {
      userId: target.id,
      vouchedBy: voucherId,
    },
  });

  // Reply
  return interaction.reply({
    content: `✅ You vouched for ${target.username}. They've been granted the ${
      interaction.guild.roles.cache.get(ROLES.PATRONS)?.name
    } role.`,
    flags: MessageFlags.Ephemeral,
  });
}
