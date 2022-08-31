import type { ArgsOf } from "discordx";
import { Client, Discord, On } from "discordx";
import { VoiceState, Snowflake, ChannelType } from "discord.js";

import Settings from "../../settings.js";

@Discord()
export default class VoiceStateUpdateListener {
    public static TEMP_CHANNELS: Snowflake[] = [];

    @On({
        event: "voiceStateUpdate"
    })
    async onVoiceStateUpdate([oldState, newState]: ArgsOf<"voiceStateUpdate">, client: Client) {
        if (oldState.channel && !newState.channel) {
            if (oldState.member?.user.id === oldState.client.user?.id) {
                await oldState.client.lavalink?.destroyPlayer(newState.guild.id);
            } else if (oldState.channel.members.get(client.user?.id as string)) {
                if (
                    oldState.channel.members.filter(
                        m => !m.user.bot
                    ).size === 0
                )
                    await oldState.guild.members.me?.voice.disconnect("No members left");
            }
        }
        this.handleTempVoiceChannels(oldState, newState);
    }

    private async handleTempVoiceChannels(oldState: VoiceState, newState: VoiceState) {
        const voiceChannelLeft = !!oldState.channelId && !newState.channelId;
        const voiceChannelMoved = !!oldState.channelId && !!newState.channelId && oldState.channelId !== newState.channelId;
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
                    {
                        name: Settings.VOICE_NAME(newState.member?.user.username!!),
                        parent: newState.channel?.parentId!!,
                        bitrate: newState.channel?.bitrate,
                        type: ChannelType.GuildVoice
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
