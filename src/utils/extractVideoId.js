// Supports youtube.com and youtu.be links with or without query strings
export function extractVideoId(messageContent) {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = messageContent.match(regex);
  return match ? match[1] : null;
}
