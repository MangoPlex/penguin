import {ArgsOf, Client, Discord, On} from "discordx";
import Penguin from "../penguin.js";

@Discord()
export default class VoiceListeners {
    @On("voiceStateUpdate")
    voiceUpdate(
        [oldState, newState]: ArgsOf<"voiceStateUpdate">,
        client: Client
    ): void {
        const queue = Penguin.musicPlayer.getQueue(oldState.guild);

        if (!queue.isReady ||
            !queue.voiceChannelId ||
            (oldState.channelId != queue.voiceChannelId && newState.channelId != queue.voiceChannelId) ||
            !queue.channel
        ) {
            return;
        }

        const channel = oldState.channelId === queue.voiceChannelId ? oldState.channel : newState.channel;

        if (!channel) {
            return;
        }

        const totalMembers = channel.members.filter((m) => !m.user.bot);

        if (queue.isPlaying && !totalMembers.size) {
            queue.pause();
            queue.channel.send(
                "> To save resources, I have paused the queue since everyone has left my voice channel."
            );
        } else if (queue.isPause && totalMembers.size) {
            queue.resume();
            queue.channel.send(
                "> There has been a new participant in my voice channel, and the queue will be resumed. Enjoy the music 🎶"
            );
        }
    }
}