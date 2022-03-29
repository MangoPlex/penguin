import { MessageEmbed, TextChannel, VoiceChannel } from "discord.js";
import { Client, Discord, Once } from "discordx";

import TimeUtils from "../../util/timeUtils.js";
import CryptoHelper from "../../common/cryptoHelper.js";
import VoiceStateUpdateListener from "../voice/voiceStateUpdateListener.js";
import Settings from "../../settings.js";

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

        this.purgeTempVoiceChannels(client);
        // this.cryptoTracking(client);

        setInterval(() => {
            client.user!.setActivity(
                `Uptime: ${TimeUtils.fromMStoDHM(process.uptime() * 1000)}`,
                { type: "WATCHING" }
            );
        }, 6e4);
    }

    private async purgeTempVoiceChannels(client: Client) {
        (await client.channels.cache.filter(channel => channel.isVoice())).forEach(channel => {
            channel = channel as VoiceChannel;
            // temporary way to handle temporary voicechat 
            if (Settings.VOICE_NAME_REGEX.test(channel.name)) {
                if (channel.members.size == 0)
                    channel.delete();
                else VoiceStateUpdateListener.TEMP_CHANNELS.push(channel.id);
            }
        })
    }
}