import type { ArgsOf } from "discordx";
import { Client, Discord, On } from "discordx";
import { VoiceState, VoiceChannel } from "discord.js";

import Settings from "../../settings.js";

@Discord()
export default class VoiceStateUpdateListener {
    public static TEMP_CHANNELS: VoiceChannel[] = [];

    @On("voiceStateUpdate")
    async onVoiceStateUpdate([oldState, newState]: ArgsOf<"voiceStateUpdate">, client: Client) {
        this.handleTempVoiceChannels(client, oldState, newState);
    }

    private async handleTempVoiceChannels(client: Client, oldState: VoiceState, newState: VoiceState) {
        const voiceChannelLeft   = !!oldState.channelId && !newState.channelId;
        const voiceChannelMoved  = !!oldState.channelId && !!newState.channelId && oldState.channelId !== newState.channelId;
        const voiceChannelJoined = !oldState.channelId && !!newState.channelId;

        if (voiceChannelLeft || voiceChannelMoved) {
            if (VoiceStateUpdateListener.TEMP_CHANNELS.some(channel => channel.id == oldState.channelId)) {
                if (oldState.channel!!.members.size === 0) {
                    oldState.channel!!.delete().then(() => {
                        VoiceStateUpdateListener.TEMP_CHANNELS = VoiceStateUpdateListener.TEMP_CHANNELS.filter(channel => channel.id != oldState.channelId)
                    });
                }
            }
        }

        if (voiceChannelJoined || voiceChannelMoved) {
            if (Settings.VOICE_PARENTS.includes(newState.channelId!!)) {
                const channel = await newState.guild.channels.create(
                    `#${VoiceStateUpdateListener.TEMP_CHANNELS.length + 1} | ${newState.member?.user.username}'s lounge`,
                    {
                        parent: newState.channel?.parentId!!,
                        bitrate: newState.channel?.bitrate,
                        type: "GUILD_VOICE"
                    }
                );
                channel.setRTCRegion(newState.channel?.rtcRegion!!)
                newState.setChannel(channel);
            }
        }
    }
}