import { dirname, resolve } from "@discordx/importer";
import chokidar from "chokidar";
import { DIService, MetadataStorage } from "discordx";
import dotenv from "dotenv";

import { bot } from "./bot.js";

// The following syntax should be used in the ECMAScript environment
const importPattern = `${dirname(import.meta.url)}/features/**/*.{ts,js}`;

/**
 * Import files
 *
 * (This is a work around for imports, if it is possible to delete cache from ESM, let me know.)
 *
 * @param src glob pattern
 */
export async function LoadFiles(src: string): Promise<void> {
  const files = await resolve(src);
  await Promise.all(
    files.map((file) => import(`${file}?version=${Date.now().toString()}`)),
  );
}

/**
 * Reload commands for discordx
 */
async function Reload() {
  console.log("> Reloading modules\n");

  // Remove events
  bot.removeEvents();

  // cleanup
  MetadataStorage.clear();
  DIService.engine.clearAllServices();

  // reload files
  await LoadFiles(importPattern);

  // rebuild
  await MetadataStorage.instance.build();
  await bot.initApplicationCommands();
  bot.initEvents();

  console.log("> Reload success\n");
}

/**
 * Initialize
 */
async function run() {
  const watcher = chokidar.watch(importPattern);

  dotenv.config();

  // Load commands
  await LoadFiles(importPattern);

  // Let's start the bot
  if (!process.env.DISCORD_BOT_TOKEN) {
    throw Error("Could not find BOT_TOKEN in your environment");
  }

  // Log in with your bot token
  await bot.login(process.env.DISCORD_BOT_TOKEN);

  // Hot Module reload
  if (process.env.NODE_ENV !== "production") {
    console.log(
      "> Hot-Module-Reload enabled in development. Commands will automatically reload.",
    );

    // Watch changed files using chikidar
    watcher.on("add", () => void Reload());
    watcher.on("change", () => void Reload());
    watcher.on("unlink", () => void Reload());
  }
}

void run();
