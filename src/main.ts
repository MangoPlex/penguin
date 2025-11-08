import "reflect-metadata";
(await import("dotenv")).config({ quiet: true, });
import { dirname, importx } from "@discordx/importer";

import { bot } from "./bot.js";
import { ds } from "./utilities/db.js";

async function run() {
  await importx(`${dirname(import.meta.url)}/{features}/**/*.{ts,js}`);

  // Let's start the bot
  if (!process.env.DISCORD_TOKEN) {
    throw Error("Could not find DISCORD_TOKEN in your environment");
  }
  // Log in with your bot token
  await bot.login(process.env.DISCORD_TOKEN);
}

await ds.setOptions({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  username: process.env.PG_USER,
  password: process.env.PG_PWD,
  database: process.env.PG_DB,
  entities: [
    dirname(import.meta.url) + "/entities/**/*{.ts,.js}",
  ],
  cache: true,
});

await ds.initialize();

void run();
