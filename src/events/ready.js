import { name as presenceName, setPresence } from "../boot/setPresence.js";
import { checkLiveUsers } from "../boot/checkLiveUsers.js";

export const name = "ready";
export const once = true;

export async function execute(client) {
  console.log(`🟢 Bot is online as ${client.user.tag}`);

  await setPresence(client);
  await checkLiveUsers(client);
}
