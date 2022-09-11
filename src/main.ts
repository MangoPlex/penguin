import "@sapphire/plugin-logger/register";
import { SapphireClient, LogLevel } from "@sapphire/framework";
import { Intents } from "discord.js";

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

export const client = new SapphireClient({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_VOICE_STATES
    ],
    logger: {
        level: process.env.NODE_ENV !== "production" ? LogLevel.Debug : LogLevel.Error
    }
});

await client.login(process.env.DISCORD_TOKEN!);
client.logger.info(`Started! (${Date.now() - startTime}ms)`);