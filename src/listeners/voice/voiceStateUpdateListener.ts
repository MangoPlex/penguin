import { Listener } from "@sapphire/framework";
import type { VoiceState, Snowflake } from "discord.js";

import Settings from "../../settings.js";

export class VoiceStateUpdateListener extends Listener {
  public static TEMP_CHANNELS: Snowflake[] = [];
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      event: "voiceStateUpdate",
    });
  }

  public async run(oldState: VoiceState, newState: VoiceState): Promise<void> {
    const { client } = this.container;
    if (oldState.channel && !newState.channel) {
      if (oldState.member?.user.id === oldState.client.user?.id) {
        await oldState.client.lavalink?.destroyPlayer(newState.guild.id);
      } else if (oldState.channel.members.get(client.user?.id as string)) {
        if (oldState.channel.members.filter((m) => !m.user.bot).size === 0)
          await oldState.guild.me?.voice.disconnect("No members left");
      }
    }
    this.handleTempVoiceChannels(oldState, newState);
  }

  private async handleTempVoiceChannels(
    oldState: VoiceState,
    newState: VoiceState
  ) {
    const voiceChannelLeft = !!oldState.channelId && !newState.channelId;
    const voiceChannelMoved =
      !!oldState.channelId &&
      !!newState.channelId &&
      oldState.channelId !== newState.channelId;
    const voiceChannelJoined = !oldState.channelId && !!newState.channelId;

    if (voiceChannelLeft || voiceChannelMoved) {
      if (
        VoiceStateUpdateListener.TEMP_CHANNELS.some(
          (channelId) => channelId == oldState.channelId
        )
      ) {
        if (oldState.channel!!.members.filter((m) => !m.user.bot).size === 0) {
          try {
            await oldState.channel!!.delete();
            VoiceStateUpdateListener.TEMP_CHANNELS =
              VoiceStateUpdateListener.TEMP_CHANNELS.filter(
                (channelId) => channelId != oldState.channelId
              );
          } catch (ignore) {}
        }
      }
    }

    if (voiceChannelJoined || voiceChannelMoved) {
      if (Settings.VOICE_PARENTS.includes(newState.channelId!!)) {
        const channel = await newState.guild.channels.create(
          Settings.VOICE_NAME(newState.member?.user.username!!),
          {
            parent: newState.channel?.parentId!!,
            bitrate: newState.channel?.bitrate,
            type: "GUILD_VOICE",
          }
        );

        channel.lockPermissions();
        channel.setRTCRegion(newState.channel?.rtcRegion!!);
        newState.setChannel(channel);

        VoiceStateUpdateListener.TEMP_CHANNELS.push(channel.id);
      }
    }
  }
}
