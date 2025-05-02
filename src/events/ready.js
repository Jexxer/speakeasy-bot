import { ActivityType } from "discord.js";

export const name = "ready";
export const once = true;

export function execute(client) {
  console.log(`🟢 Bot is online as ${client.user.tag}`);

  client.user.setPresence({
    status: "online",
    activities: [
      {
        name: "from the shadows",
        type: ActivityType.Watching,
      },
    ],
  });
}
