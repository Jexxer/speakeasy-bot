import { handleSteamLink } from "./message-handlers/steamHandler.js";
import { handleTwitchClip } from "./message-handlers/twitchHandler.js";
import { handleYouTubeLink } from "./message-handlers/youtubeHandler.js";
// import more handlers as you add them

export const name = "messageCreate";

export async function execute(message) {
  if (message.author.bot || !message.guild) return;

  // Modular message logic
  await Promise.all([
    handleYouTubeLink(message),
    handleTwitchClip(message),
    handleSteamLink(message),
    // await handleModeration(message),
    // await handleBotMention(message),
  ]);
}
