import "reflect-metadata";
(await import("dotenv")).config({ quiet: true, });
import { dirname, importx } from "@discordx/importer";

import { bot } from "./bot.js";
import { ds } from "./utilities/db.js";
import { User } from "./entities/User.js";

async function run() {
  await importx(`${dirname(import.meta.url)}/{features,commands}/**/*.{ts,js}`);

  // Let's start the bot
  if (!process.env.DISCORD_TOKEN) {
    throw Error("Could not find DISCORD_TOKEN in your environment");
  }
  // Log in with your bot token
  await bot.login(process.env.DISCORD_TOKEN);

  await bot.application?.emojis.fetch();
}

ds.setOptions({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  username: process.env.PG_USER,
  password: process.env.PG_PWD,
  database: process.env.PG_DB,
  entities: [
    User,
  ],
  cache: true,
  synchronize: String(process.env.NODE_ENV).toLowerCase() === "development",
});

await ds.initialize();

void run();
