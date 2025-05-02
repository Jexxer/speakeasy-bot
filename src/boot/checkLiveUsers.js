import { ActivityType } from "discord.js";
import { ROLES } from "../config/roles.js";

export async function checkLiveUsers(client) {
  // Wait for presence data to settle
  await new Promise((res) => setTimeout(res, 1000));

  for (const [guildId, guild] of client.guilds.cache) {
    console.log(`🔍 Checking live users in ${guild.name}...`);

    try {
      await guild.members.fetch();

      for (const [_, member] of guild.members.cache) {
        if (!member.presence) continue;

        const isStreaming = member.presence.activities.some(
          (a) =>
            a.type === ActivityType.Streaming && a.url?.includes("twitch.tv")
        );

        const hasRole = member.roles.cache.has(ROLES.LIVE_NOW);

        if (isStreaming && !hasRole) {
          try {
            await member.roles.add(ROLES.LIVE_NOW);
            console.log(`🟣 ${member.user.tag} is live. Role added.`);
          } catch (err) {
            console.error(
              `❌ Failed to add role to ${member.user.tag}: ${err.message}`
            );
          }
        }

        if (!isStreaming && hasRole) {
          try {
            await member.roles.remove(ROLES.LIVE_NOW);
            console.log(`⚫️ ${member.user.tag} is not live. Role removed.`);
          } catch (err) {
            console.error(
              `❌ Failed to remove role from ${member.user.tag}: ${err.message}`
            );
          }
        }
      }
    } catch (err) {
      console.error(
        `❌ Failed to check live users in ${guild.name}:`,
        err.message
      );
    }
  }
}
