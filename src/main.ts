import { dirname, importx } from "@discordx/importer";

import { bot } from "./bot.js";

async function run() {
  await importx(`${dirname(import.meta.url)}/{features}/**/*.{ts,js}`);

  // Let's start the bot
  if (!process.env.DISCORD_BOT_TOKEN) {
    throw Error("Could not find BOT_TOKEN in your environment");
  }

  // Log in with your bot token
  await bot.login(process.env.DISCORD_BOT_TOKEN);
}

void run();
