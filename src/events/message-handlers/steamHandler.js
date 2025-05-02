// src/events/message-handlers/steamHandler.js
import axios from "axios";
import { EmbedBuilder } from "discord.js";

// Extracts the AppID from a Steam store URL
function extractAppId(url) {
  const match = url.match(/store\.steampowered\.com\/app\/(\d+)/);
  return match ? match[1] : null;
}

function getRelativeTimestamp(rd) {
  try {
    const releaseDate = new Date(rd);
    const unixTimestamp = Math.floor(releaseDate.getTime() / 1000);
    return `<t:${unixTimestamp}:R>`;
  } catch (error) {
    console.error("Error parsing release date:", error);
    return rd?.date || "Unknown";
  }
}

// Builds the Discord embed for a Steam game
function buildSteamGameEmbed(data, message, playerCount) {
  const {
    name,
    header_image,
    short_description,
    is_free,
    price_overview,
    release_date,
    steam_appid,
  } = data;

  const release = getRelativeTimestamp(release_date?.date);
  const steamUrl = `https://store.steampowered.com/app/${steam_appid}`;

  const priceText = is_free
    ? "🆓 Free to Play"
    : price_overview
    ? `💲 $${(price_overview.final / 100).toFixed(2)}${
        price_overview.discount_percent
          ? ` (**${price_overview.discount_percent}% off!**)`
          : ""
      }`
    : "❓ Price Unknown";

  return new EmbedBuilder()
    .setColor("Blurple")
    .setTitle(name)
    .setURL(steamUrl)
    .setDescription(short_description || "*No description available.*")
    .setThumbnail(
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/800px-Steam_icon_logo.svg.png"
    )
    .addFields(
      { name: "📅 Release", value: release, inline: true },
      { name: "💰 Price", value: priceText, inline: true },
      {
        name: "👥 Playing Now",
        value: `${playerCount.toLocaleString()} players`,
      }
    )
    .setImage(header_image)
    .setFooter({
      text: `Posted by: ${
        message.member?.displayName || message.author.username
      }`,
      iconURL: message.author.displayAvatarURL({ dynamic: true }),
    });
}

export async function handleSteamLink(message) {
  if (message.author.bot || !message.guild) return;

  const urls = message.content.match(/https?:\/\/\S+/g);
  if (!urls) return;

  const steamUrl = urls.find((url) =>
    url.includes("store.steampowered.com/app/")
  );
  if (!steamUrl) return;

  const appId = extractAppId(steamUrl);
  if (!appId) return;

  try {
    // Get game info
    const storeRes = await axios.get(
      `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=us&l=en`
    );
    const appData = storeRes.data[appId];
    if (!appData.success) return;

    const gameData = appData.data;

    // Get current players
    let playerCount = 0;
    try {
      const countRes = await axios.get(
        `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appId}`
      );
      playerCount = countRes.data?.response?.player_count || 0;
    } catch (err) {
      console.warn("⚠️ Failed to fetch current player count:", err.message);
    }

    const embed = buildSteamGameEmbed(gameData, message, playerCount);

    await message.delete();
    await message.channel.send({ embeds: [embed] });
  } catch (err) {
    console.error("❌ Failed to fetch Steam data:", err.message);
  }
}
