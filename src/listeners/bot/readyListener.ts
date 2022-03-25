import { MessageEmbed, TextChannel, VoiceChannel } from "discord.js";
import {Client, Discord, Once} from "discordx";
import TimeUtils from "../../util/timeUtils.js";

import CryptoHelper from "../../common/cryptoHelper.js";
import VoiceStateUpdateListener from "../voice/voiceStateUpdateListener.js";
import Settings from "../../settings.js";

@Discord()
export default class ReadyListener {
    @Once("ready")
    async onReady({}, client: Client) {
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
                `Uptime: ${ TimeUtils.fromStoDHM(process.uptime()) }`,
                { type: "WATCHING" }
            );
        }, 6e4);
    }

    fetchAlimeGirlPics() {

    }

    private async purgeTempVoiceChannels(client: Client) {
        (await client.channels.cache.filter(channel => channel.isVoice())).forEach(channel => {
            channel = channel as VoiceChannel
            if (Settings.VOICE_NAME_REGEX.test(channel.name)) {
                if (channel.members.size == 0)
                    channel.delete();
                else VoiceStateUpdateListener.TEMP_CHANNELS.push(channel.id);
            }
        })
    }

    private async cryptoTracking(client: Client) {
        setInterval(async () => {
            // HARDCODED
            const channel: TextChannel = await client.channels.fetch("934320425217957928")! as TextChannel;
            const message = await channel?.messages.fetch("934329984154230804");
            // HARDCODED

            const btc = await CryptoHelper.getCryptoPrice("bitcoin");
            const eth = await CryptoHelper.getCryptoPrice("ethereum");
            const doge = await CryptoHelper.getCryptoPrice("dogecoin");
            const mana = await CryptoHelper.getCryptoPrice("decentraland");

            message.edit({
                embeds: [
                    new MessageEmbed()
                        .setAuthor("Crypto tracking", "https://theme.zdassets.com/theme_assets/2186968/011d864ead44b8190c81a319a6caff00345e04de.png", "https://coinmarketcap.com/")
                        .setColor("YELLOW")
                        .addField("**CRYPTOS:**", `
                        BTC: ${btc.usd} (${btc.vnd})
                        ETH: ${eth.usd} (${eth.vnd}) 
                    `, true)
                        .addField("**TOKENS:**", `
                        DOGE: ${doge.usd} (${doge.vnd})
                        MANA: ${mana.usd} (${mana.vnd})
                    `, true)
                    .setFooter("Update every 5 mins")
                    .setTimestamp()
                ]
            });
        }, 300000);
    }
}