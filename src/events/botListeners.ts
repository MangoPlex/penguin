import {Client, Discord, Once} from "discordx";
import TimeUtils from "../util/timeUtils.js";
import PenguinConstants from "../penguinConstants.js";

@Discord()
export default class BotListeners {
    @Once("ready")
    async onReady({}, client: Client) {
        console.log("Initialized and logged in as " + client.user!.tag);
        console.log("Starting...");

        await client.clearApplicationCommands();
        await client.clearApplicationCommands(PenguinConstants.GUILD_ID);
        await client.initApplicationCommands({
            guild: { log: true },
            global: { log: false },
        });
        await client.initApplicationPermissions();

        setInterval(() => {
            client.user!.setActivity(
                `Uptime: ${ TimeUtils.fromStoDHM(process.uptime()) }`,
                { type: "WATCHING" }
            );
        }, 6e4);
    }

}