import "reflect-metadata";
import {Client} from "discordx";
import {Intents} from "discord.js";
import {dirname, importx} from "@discordx/importer";

import * as dotenv from "dotenv";
import * as util from "util";

const startTime = Date.now();

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

// Replace log
const origLog = console.log;
console.log = function () {
    const strDate = `[${new Date().toLocaleString()}] `;
    const logString = strDate + util.format.apply(util.format, Array.prototype.slice.call(arguments));
    origLog(logString);
};

export const client = new Client({
    // Discord.js
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],

    // Discord.ts (Discordx)
    botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
})

console.log("Initializing...");

await importx(dirname(import.meta.url) + "/{listeners,commands}/**/*.{ts,js}");
await client.login(process.env.DISCORD_TOKEN!);

console.log(`Started! (${Date.now() - startTime}ms)`)