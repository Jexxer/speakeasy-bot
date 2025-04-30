// src/index.js
import { Client, GatewayIntentBits, Collection } from "discord.js";
import dotenv from "dotenv";
import { registerEvents } from "./handlers/registerEvents.js";
import { registerCommands } from "./handlers/registerCommands.js";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

await registerEvents(client);
await registerCommands(client);

client.login(process.env.BOT_TOKEN);
