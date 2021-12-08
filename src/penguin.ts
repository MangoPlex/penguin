import "reflect-metadata";
import {Client} from "discordx";
import {Intents} from "discord.js";
import PenguinConstants from "./penguinConstants.js";
import {dirname, importx} from "@discordx/importer";
import * as util from "util";
import * as os from "os";

export default class Penguin extends Client{
    static startTime = Date.now();

    constructor() {
        super({
            // Discord.js
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MEMBERS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                Intents.FLAGS.GUILD_VOICE_STATES
            ],

            // Discord.ts (Discordx)
            botGuilds: [PenguinConstants.GUILD_ID],
        });

        const origLog = console.log;
        console.log = function () {
            const strDate = `[${new Date().toLocaleString()}] `;
            const logString = strDate + util.format.apply(util.format, Array.prototype.slice.call(arguments));
            origLog(logString);
        };
    }

    static async start(): Promise<void> {
        console.log(`System Info:\n - OS: ${os.type()}\n - CPU: ${os.cpus()[0].model}\n - MEMORY: ${Math.floor(os.freemem() / 1024 / 1024 )}/${Math.floor(os.totalmem() / 1024 / 1024 )} MB`);
        const client = new Penguin();

        console.log("Initializing...");
        await importx(dirname(import.meta.url) + "/{events,commands}/**/*.{ts,js}");

        await client.login(process.env.DISCORD_TOKEN ?? "ODI5NzI2MTU2MzI0MDc3NTg4.YG8Usw.Pktyh6X3a2fCeLV3IVSXdIrCQcw");
        await client.clearApplicationCommands();
        await client.clearApplicationCommands(PenguinConstants.GUILD_ID);
        await client.initApplicationCommands();
        await client.initApplicationPermissions();
    }
}

Penguin.start().then(() => console.log(`Started! (${Date.now() - Penguin.startTime}ms)`));