import { extractClipIdFromUrl, getTwitchClipInfo } from "../../apis/twitch.js";
import { EmbedBuilder, time } from "discord.js";

export async function handleTwitchClip(message) {
  const urls = message.content.match(/https?:\/\/\S+/g);
  if (!urls) return;

  const clipUrl = urls.find(
    (url) => url.includes("twitch.tv") && url.includes("clip")
  );
  if (!clipUrl) return;

  const clipId = extractClipIdFromUrl(clipUrl);
  if (!clipId) return;

  const clip = await getTwitchClipInfo(clipId);
  if (!clip) return;

  const embed = new EmbedBuilder()
    .setColor("Purple")
    .setTitle(clip.title)
    .setURL(clip.url)
    .setAuthor({ name: clip.broadcasterName })
    .setDescription(
      `🎥 Clipped by **${clip.creatorName}**\n👁️ **${
        clip.viewCount
      } views** • ⏱️ **${Math.round(clip.duration)}s** • 🕒 ${time(
        new Date(clip.createdAt),
        "R"
      )}`
    )
    .setImage(
      clip.thumbnailUrl.replace(
        /-preview-\d+x\d+\.jpg$/,
        "-preview-480x272.jpg"
      )
    )
    .setFooter({
      text: `Posted by: ${message.member?.nickname || message.author.username}`,
      iconURL: message.author.displayAvatarURL(),
    });

  try {
    await message.delete();
    await message.channel.send({ embeds: [embed] });
  } catch (err) {
    console.error("❌ Error posting Twitch embed:", err.message);
  }
}
