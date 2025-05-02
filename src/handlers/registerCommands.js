import { readdirSync } from "fs";
import { join } from "path";
import { REST, Routes } from "discord.js";
import { GUILD } from "../config/constants.js";
import dotenv from "dotenv";

dotenv.config();

export async function registerCommands(client) {
  console.log("✅ registerCommands: Loading slash commands...");

  const commands = [];
  const commandsPath = join(process.cwd(), "src", "commands");
  const commandFiles = readdirSync(commandsPath).filter((file) =>
    file.endsWith(".js")
  );

  for (const file of commandFiles) {
    const { data, execute } = await import(`../commands/${file}`);

    if (!data || !execute) {
      console.warn(`⚠️ Skipping command '${file}': Missing data or execute`);
      continue;
    }

    client.commands.set(data.name, { data, execute });
    commands.push(data.toJSON());

    console.log(`✅ Loaded /${data.name}`);
  }

  // Register with Discord (per-guild)
  const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

  try {
    console.log(`🔁 Registering ${commands.length} command(s) with Discord...`);
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, GUILD.ID),
      { body: commands }
    );
    console.log("✅ Slash commands registered with Discord.");
  } catch (err) {
    console.error("❌ Failed to register commands:", err);
  }
}
