import { readdirSync } from "fs";
import { join } from "path";

export async function registerEvents(client) {
  const eventsPath = join(process.cwd(), "src", "events");
  const eventFiles = readdirSync(eventsPath).filter((file) =>
    file.endsWith(".js")
  );

  for (const file of eventFiles) {
    const { name, once, execute } = await import(`../events/${file}`);

    if (!name || !execute) {
      console.warn(
        `⚠️ Skipping event '${file}': missing 'name' or 'execute' export`
      );
      continue;
    }

    if (once) {
      client.once(name, (...args) => execute(client, ...args));
    } else {
      client.on(name, (...args) => execute(client, ...args));
    }

    console.log(`✅ Registered event: ${name} (${once ? "once" : "on"})`);
  }
}
