import {Player} from "@discordx/music";
import MusicQueue from "./musicQueue.js";
import {Guild, TextBasedChannels} from "discord.js";

export default class MusicPlayer extends Player {
    constructor() {
        super();

        this.on<MusicQueue, "onStart">("onStart", ([queue]) => {
            queue.updateControlMessage({ force: true });
        });

        this.on<MusicQueue, "onFinishPlayback">("onFinishPlayback", ([queue]) => {
            queue.leave();
        });

        this.on<MusicQueue, "onPause">("onPause", ([queue]) => {
            queue.updateControlMessage();
        });

        this.on<MusicQueue, "onResume">("onResume", ([queue]) => {
            queue.updateControlMessage();
        });

        this.on<MusicQueue, "onError">("onError", ([queue, err]) => {
            queue.updateControlMessage({
                force: true,
                text: `Error: ${err.message}`,
            });
        });

        this.on<MusicQueue, "onFinish">("onFinish", ([queue]) => {
            queue.updateControlMessage();
        });

        this.on<MusicQueue, "onLoop">("onLoop", ([queue]) => {
            queue.updateControlMessage();
        });

        this.on<MusicQueue, "onRepeat">("onRepeat", ([queue]) => {
            queue.updateControlMessage();
        });

        this.on<MusicQueue, "onSkip">("onSkip", ([queue]) => {
            queue.updateControlMessage();
        });

        this.on<MusicQueue, "onTrackAdd">("onTrackAdd", ([queue]) => {
            queue.updateControlMessage();
        });

        this.on<MusicQueue, "onLoopEnabled">("onLoopEnabled", ([queue]) => {
            queue.updateControlMessage();
        });

        this.on<MusicQueue, "onLoopDisabled">("onLoopDisabled", ([queue]) => {
            queue.updateControlMessage();
        });

        this.on<MusicQueue, "onRepeatEnabled">("onRepeatEnabled", ([queue]) => {
            queue.updateControlMessage();
        });

        this.on<MusicQueue, "onRepeatDisabled">("onRepeatDisabled", ([queue]) => {
            queue.updateControlMessage();
        });

        this.on<MusicQueue, "onMix">("onMix", ([queue]) => {
            queue.updateControlMessage();
        });

        this.on<MusicQueue, "onVolumeUpdate">("onVolumeUpdate", ([queue]) => {
            queue.updateControlMessage();
        });
    }

    getQueue(guild: Guild, channel?: TextBasedChannels): MusicQueue {
        return super.queue<MusicQueue>(guild, () => new MusicQueue(this, guild, channel));
    }
}