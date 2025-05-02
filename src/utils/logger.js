// src/utils/logger.js
import { AllowedMentionsTypes } from "discord.js";
import { GUILD } from "../config/constants.js";

let botClient = null;

export function setLoggerClient(client) {
  botClient = client;
}

export async function logIncident(message) {
  try {
    if (!botClient) throw new Error("Logger client is not set");

    const guild = await botClient.guilds.fetch(GUILD.ID);
    const channel = await guild.channels.fetch(GUILD.CHANNELS.INCIDENT_LOG_ID);
    if (!channel || !channel.isTextBased()) return;

    await channel.send({ content: message, allowedMentions: { parse: [] } });
  } catch (err) {
    console.error("❌ Failed to log incident:", err.message);
  }
}
