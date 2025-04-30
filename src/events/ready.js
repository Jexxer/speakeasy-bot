export const name = "ready";
export const once = true;

export function execute(client) {
  console.log(`🟢 Bot is online as ${client.user.tag}`);
}
