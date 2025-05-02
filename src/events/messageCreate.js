import { handleYouTubeLink } from "./message-handlers/youtubeHandler.js";
// import more handlers as you add them

export const name = "messageCreate";

export async function execute(message) {
  if (message.author.bot || !message.guild) return;

  // Modular message logic
  await Promise.all([
    handleYouTubeLink(message),
    // await handleModeration(message),
    // await handleBotMention(message),
  ]);
}
