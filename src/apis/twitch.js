import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

let cachedToken = null;
let tokenExpiresAt = 0;

export async function getTwitchAppToken() {
  const now = Date.now();

  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  try {
    const res = await axios.post("https://id.twitch.tv/oauth2/token", null, {
      params: {
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        grant_type: "client_credentials",
      },
    });

    const { access_token, expires_in } = res.data;

    cachedToken = access_token;
    tokenExpiresAt = now + expires_in * 1000;

    console.log("🎟 New Twitch token acquired.");
    return cachedToken;
  } catch (err) {
    console.error("❌ Failed to get Twitch token:", err.message);
    throw err;
  }
}

export async function getTwitchClipInfo(clipId) {
  const token = await getTwitchAppToken();

  try {
    const res = await axios.get("https://api.twitch.tv/helix/clips", {
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`,
      },
      params: {
        id: clipId,
      },
    });

    const clip = res.data.data[0];
    if (!clip) {
      throw new Error("Clip not found");
    }

    return {
      title: clip.title,
      broadcasterName: clip.broadcaster_name,
      creatorName: clip.creator_name,
      viewCount: clip.view_count,
      duration: clip.duration,
      createdAt: clip.created_at,
      thumbnailUrl: clip.thumbnail_url,
      url: clip.url,
    };
  } catch (err) {
    console.error("❌ Failed to fetch clip data:", err.message);
    return null;
  }
}

export function extractClipIdFromUrl(url) {
  // Supports both clip.twitch.tv and twitch.tv/username/clip/slug
  const directMatch = url.match(/clips\.twitch\.tv\/([a-zA-Z0-9_-]+)/);
  if (directMatch) return directMatch[1];

  const embeddedMatch = url.match(/twitch\.tv\/\w+\/clip\/([a-zA-Z0-9_-]+)/);
  if (embeddedMatch) return embeddedMatch[1];

  return null;
}
