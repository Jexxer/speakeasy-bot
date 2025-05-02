import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function fetchVideoDetails(videoId) {
  try {
    const res = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          key: process.env.YOUTUBE_API_KEY,
          part: "snippet,statistics",
          id: videoId,
        },
      }
    );

    const video = res.data.items[0];
    if (!video) return null;

    const {
      snippet: {
        title,
        channelTitle,
        publishedAt,
        description,
        thumbnails: { high },
      },
      statistics: { viewCount = 0, likeCount = 0, commentCount = 0 },
    } = video;

    return {
      title,
      channel: channelTitle,
      description,
      views: Number(viewCount),
      likes: Number(likeCount),
      comments: Number(commentCount),
      publishedAt,
      thumbnail: high.url,
      url: `https://youtu.be/${videoId}`,
    };
  } catch (err) {
    console.error("❌ YouTube API fetch failed:", err.message);
    return null;
  }
}
