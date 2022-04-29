import type { ArgsOf } from "discordx";
import { Client, Discord, On } from "discordx";
import { VoiceState, Snowflake } from "discord.js";

import Settings from "../../settings.js";

@Discord()
export default class VoiceStateUpdateListener {
    public static TEMP_CHANNELS: Snowflake[] = [];

    @On("voiceStateUpdate")
    async onVoiceStateUpdate([oldState, newState]: ArgsOf<"voiceStateUpdate">, client: Client) {
        this.handleTempVoiceChannels(oldState, newState);
    }

    private async handleTempVoiceChannels(oldState: VoiceState, newState: VoiceState) {
        const voiceChannelLeft   = !!oldState.channelId && !newState.channelId;
        const voiceChannelMoved  = !!oldState.channelId && !!newState.channelId && oldState.channelId !== newState.channelId;
        const voiceChannelJoined = !oldState.channelId && !!newState.channelId;

        if (voiceChannelLeft || voiceChannelMoved) {
            if (VoiceStateUpdateListener.TEMP_CHANNELS.some(channelId => channelId == oldState.channelId)) {
                if (oldState.channel!!.members.size === 0) {
                    oldState.channel!!.delete().then(() => VoiceStateUpdateListener.TEMP_CHANNELS = VoiceStateUpdateListener.TEMP_CHANNELS.filter(channelId => channelId != oldState.channelId));
                }
            }
        }

        if (voiceChannelJoined || voiceChannelMoved) {
            if (Settings.VOICE_PARENTS.includes(newState.channelId!!)) {
                const channel = await newState.guild.channels.create(
                    Settings.VOICE_NAME(newState.member?.user.username!!),
                    {
                        type: "GUILD_VOICE",
                        parent: newState.channel?.parentId!!,
                        bitrate: newState.channel?.bitrate,
                    }
                );

                channel.lockPermissions();
                channel.setRTCRegion(newState.channel?.rtcRegion!!);
                newState.setChannel(channel);

                VoiceStateUpdateListener.TEMP_CHANNELS.push(channel.id)
            }
        }
    }
}
