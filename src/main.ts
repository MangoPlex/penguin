import "reflect-metadata";
import { Client } from "discordx";
import { dirname, importx } from "@discordx/importer";
import { IntentsBitField } from "discord.js";

import * as dotenv from "dotenv";
import MusicUtils from "./util/musicUtils";

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

declare module "discord.js" {
    export interface Client {
        lavalink?: MusicUtils
    }
}

const startTime = Date.now();

export const client = new Client({
    // Discord.js
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildVoiceStates
    ],

    // Discord.ts (Discordx)
    botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],

});

console.log("Initializing...");
console.log("Importing command/listener classes...");
await importx(dirname(import.meta.url) + "/{listeners,commands}/**/*.{ts,js}");
console.log("Imported")
await client.login(process.env.DISCORD_TOKEN!);
console.log(`Started! (${Date.now() - startTime}ms)`)