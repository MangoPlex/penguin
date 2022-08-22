import { Client, Discord, Once } from "discordx";

import TimeUtils from "../../util/timeUtils.js";
import MusicUtils from "../../util/musicUtils.js";

@Discord()
export default class ReadyListener {
    @Once("ready")
    async onReady({ }, client: Client) {
        console.log("Initialized and logged in as " + client.user!.tag);
        console.log("Starting...");

        await client.initApplicationCommands({
            guild: { log: true },
            global: { log: false },
        });
        await client.initApplicationPermissions();

        setInterval(() => {
            client.user!.setActivity(
                `Uptime: ${TimeUtils.fromMStoDHM(process.uptime() * 1000)}`,
                { type: "WATCHING" }
            );
        }, 6e4);

        client.lavalink = new MusicUtils(client);

        // Workaround because discordx does not support custom emitter
        client.ws.on("VOICE_SERVER_UPDATE", (data: any) => client.lavalink?.handleVoiceUpdate(data));
        client.ws.on("VOICE_STATE_UPDATE", (data: any) => client.lavalink?.handleVoiceUpdate(data));
    }
}