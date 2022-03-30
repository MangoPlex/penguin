import "reflect-metadata";
import { Client } from "discordx";
import { dirname, importx } from "@discordx/importer";
import { Intents } from "discord.js";

import * as dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

const startTime = Date.now();

export const client = new Client({
    // Discord.js
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_VOICE_STATES
    ],

    // Discord.ts (Discordx)
    botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],

})

console.log("Initializing...");
console.log("Importing command/listener classes...");
await importx(dirname(import.meta.url) + "/{listeners,commands}/**/*.{ts,js}");
console.log("Imported")
await client.login(process.env.DISCORD_TOKEN!);
console.log(`Started! (${Date.now() - startTime}ms)`)