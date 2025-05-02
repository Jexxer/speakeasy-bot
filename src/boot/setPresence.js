import { ActivityType } from "discord.js";

export const name = "setPresence";

export async function setPresence(client) {
  client.user.setPresence({
    status: "online",
    activities: [
      {
        name: "from the shadows",
        type: ActivityType.Watching,
      },
    ],
  });

  console.log("🎭 Presence set: Watching from the shadows");
}
