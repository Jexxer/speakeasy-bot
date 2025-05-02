import { extractVideoId } from "../../utils/extractVideoId.js";
import { fetchVideoDetails } from "../../apis/youtube.js";
import { EmbedBuilder } from "discord.js";

export async function handleYouTubeLink(message) {
  const videoId = extractVideoId(message.content);
  if (!videoId) return;

  const video = await fetchVideoDetails(videoId);
  if (!video) return;

  const publishedAt = new Date(video.publishedAt);
  const secondsAgo = Math.floor((Date.now() - publishedAt.getTime()) / 1000);
  const timeAgo = getRelativeTime(secondsAgo);

  const displayName = message.member?.displayName || message.author.username;

  function stripLinks(text) {
    return text.replace(/https?:\/\/\S+/g, "[link removed]");
  }

  const embed = new EmbedBuilder()
    .setTitle(video.title)
    .setURL(video.url)
    .setAuthor({ name: video.channel })
    .setDescription(
      `📅 Published **${timeAgo}**\n\n` +
        `${truncate(stripLinks(video.description))}`
    )
    .addFields(
      { name: "👁 Views", value: video.views.toLocaleString(), inline: true },
      { name: "👍 Likes", value: video.likes.toLocaleString(), inline: true },
      {
        name: "💬 Comments",
        value: video.comments.toLocaleString(),
        inline: true,
      }
    )
    .setColor("#FF0000")
    .setImage(video.thumbnail)
    .setFooter({
      text: `Posted by: ${displayName}`,
      iconURL: message.author.displayAvatarURL({ dynamic: true }),
    });

  try {
    await message.delete();
    await message.channel.send({ embeds: [embed] });
  } catch (err) {
    console.error("❌ YouTube handler error:", err.message);
  }
}

export function getRelativeTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  const months = Math.floor(days / 30.44); // average month length
  const years = Math.floor(days / 365.25); // accounting for leap years

  if (years > 0) return `${years} year${years !== 1 ? "s" : ""} ago`;
  if (months > 0) return `${months} month${months !== 1 ? "s" : ""} ago`;
  if (days > 0) return `${days} day${days !== 1 ? "s" : ""} ago`;
  if (hrs > 0) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  if (mins > 0) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
}

function truncate(text, maxLength = 300) {
  return text.length > maxLength ? text.slice(0, maxLength - 1) + "…" : text;
}
