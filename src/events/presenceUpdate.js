import { ROLES } from "../config/roles.js";

export const name = "presenceUpdate";
export const once = false;

export async function execute(oldPresence, newPresence) {
  // console.log(
  //   `[presenceUpdate] Fired for ${newPresence.user?.tag}, activity = ${newPresence.activities}`
  // );

  const member = newPresence.member;
  if (!member || !member.guild) return;

  // Helper: find if user is streaming on Twitch
  const isStreaming = newPresence.activities.some(
    (activity) => activity.type === 1 && activity.name === "Twitch"
  );

  const hasLiveNow = member.roles.cache.has(ROLES.LIVE_NOW);

  // 🟣 Start streaming
  if (isStreaming && !hasLiveNow) {
    try {
      await member.roles.add(ROLES.LIVE_NOW);
      console.log(`🟣 ${member.user.tag} is now live. Role added.`);
    } catch (err) {
      console.error("❌ Error adding Live Now role:", err.message);
    }
  }

  // ⚫️ Stopped streaming
  if (!isStreaming && hasLiveNow) {
    try {
      await member.roles.remove(ROLES.LIVE_NOW);
      console.log(`⚫️ ${member.user.tag} is no longer live. Role removed.`);
    } catch (err) {
      console.error("❌ Error removing Live Now role:", err.message);
    }
  }
}
