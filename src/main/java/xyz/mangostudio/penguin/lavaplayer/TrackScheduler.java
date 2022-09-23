package xyz.mangostudio.penguin.lavaplayer;

import com.sedmelluq.discord.lavaplayer.player.AudioPlayer;
import com.sedmelluq.discord.lavaplayer.player.event.AudioEventAdapter;
import com.sedmelluq.discord.lavaplayer.track.AudioTrack;
import com.sedmelluq.discord.lavaplayer.track.AudioTrackEndReason;

import java.util.LinkedList;

public class TrackScheduler extends AudioEventAdapter {
    private static final LinkedList<AudioTrack> QUEUE = new LinkedList<>();
    private final AudioPlayer audioPlayer;

    public TrackScheduler(AudioPlayer audioPlayer) {
        this.audioPlayer = audioPlayer;
    }

    public void enqueue(AudioTrack track) {
        if (!this.audioPlayer.startTrack(track, true))
            QUEUE.add(track);
    }

    public LinkedList<AudioTrack> getQueue() {
        return QUEUE;
    }

    public void startTrack(boolean noInterrupt) {
        audioPlayer.startTrack(QUEUE.poll(), noInterrupt);
    }

    @Override
    public void onTrackEnd(AudioPlayer player, AudioTrack track, AudioTrackEndReason endReason) {
        if (endReason.mayStartNext) {
            this.startTrack(false);
        }
    }
}
