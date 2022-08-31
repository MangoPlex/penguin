import { Client, Discord, Once } from "discordx";

import TimeUtils from "../../util/timeUtils.js";
import MusicUtils from "../../util/musicUtils.js";
import { ActivityType, GatewayDispatchEvents } from "discord.js";

@Discord()
export default class ReadyListener {
    @Once({
        event: "ready"
    })
    async onReady({ }, client: Client) {
        console.log("Initialized and logged in as " + client.user!.tag);
        console.log("Starting...");

        await client.initApplicationCommands({
            guild: { log: true },
            global: { log: false },
        });
        // Removed bc bots cannot control permission anymore
        // see: https://discord.com/developers/docs/topics/permissions
        // await client.initApplicationPermissions();

        setInterval(() => {
            client.user!.setActivity(
                `Uptime: ${TimeUtils.fromMStoDHM(process.uptime() * 1000)}`,
                { type: ActivityType.Watching }
            );
        }, 6e4);

        client.lavalink = new MusicUtils(client);

        // Workaround because discordx does not support custom emitter
        client.ws.on(GatewayDispatchEvents.VoiceServerUpdate, (data: any) => client.lavalink?.handleVoiceUpdate(data));
        client.ws.on(GatewayDispatchEvents.VoiceStateUpdate, (data: any) => client.lavalink?.handleVoiceUpdate(data));
    }
}