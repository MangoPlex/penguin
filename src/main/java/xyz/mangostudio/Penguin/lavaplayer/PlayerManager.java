package xyz.mangostudio.penguin.lavaplayer;

import com.sedmelluq.discord.lavaplayer.player.AudioLoadResultHandler;
import com.sedmelluq.discord.lavaplayer.player.AudioPlayerManager;
import com.sedmelluq.discord.lavaplayer.player.DefaultAudioPlayerManager;
import com.sedmelluq.discord.lavaplayer.source.AudioSourceManagers;
import com.sedmelluq.discord.lavaplayer.tools.FriendlyException;
import com.sedmelluq.discord.lavaplayer.track.AudioPlaylist;
import com.sedmelluq.discord.lavaplayer.track.AudioTrack;
import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.entities.Guild;
import net.dv8tion.jda.api.entities.User;
import net.dv8tion.jda.api.interactions.InteractionHook;
import net.dv8tion.jda.api.interactions.commands.SlashCommandInteraction;

import java.util.HashMap;
import java.util.Map;

public class PlayerManager {
    private static PlayerManager INSTANCE;
    private final Map<String, GuildMusicManager> musicManagers;
    private final AudioPlayerManager audioPlayerManager;

    public PlayerManager() {
        this.musicManagers = new HashMap<>();
        this.audioPlayerManager = new DefaultAudioPlayerManager();
        AudioSourceManagers.registerRemoteSources(this.audioPlayerManager);
        AudioSourceManagers.registerLocalSource(this.audioPlayerManager);
    }

    public static PlayerManager getInstance() {
        if (INSTANCE == null)
            INSTANCE = new PlayerManager();
        return INSTANCE;
    }

    public void loadAndPlay(InteractionHook hook, String trackUrl, User requester) {
        GuildMusicManager musicManager = this.getMusicManager(hook.getInteraction().getGuild());
        this.audioPlayerManager.loadItemOrdered(musicManager, trackUrl, new AudioLoadResultHandler() {
            @Override
            public void trackLoaded(AudioTrack track) {
                track.setUserData(requester.getId());
                musicManager.getScheduler().enqueue(track);
                hook.editOriginalEmbeds(
                        new EmbedBuilder()
                                .setDescription("Added **" + track.getInfo().title + "** to the queue")
                                .build()
                ).queue();
            }

            @Override
            public void playlistLoaded(AudioPlaylist playlist) {
                if (trackUrl.startsWith("ytsearch:")) {
                    AudioTrack track = playlist.getTracks().get(0);
                    this.trackLoaded(track);
                    return;
                }

                for (AudioTrack track : playlist.getTracks()) {
                    track.setUserData(requester.getId());
                    musicManager.getScheduler().enqueue(track);
                }

                hook.editOriginalEmbeds(
                        new EmbedBuilder()
                                .setDescription("Added playlist **" + playlist.getName() + "** to the queue")
                                .build()
                ).queue();
            }

            @Override
            public void noMatches() {
                hook.editOriginalEmbeds(
                        new EmbedBuilder()
                                .setDescription("Not found")
                                .build()
                ).queue();
            }

            @Override
            public void loadFailed(FriendlyException exception) {
                hook.editOriginalEmbeds(
                        new EmbedBuilder()
                                .setDescription("Load failed")
                                .build()
                ).queue();
                exception.printStackTrace();
            }
        });
    }

    public GuildMusicManager getMusicManager(Guild guild) {
        return this.musicManagers.computeIfAbsent(guild.getId(), (guildId) -> {
            GuildMusicManager guildMusicManager = new GuildMusicManager(this.audioPlayerManager);
            guild.getAudioManager().setSendingHandler(guildMusicManager.getSendHandler());
            return guildMusicManager;
        });
    }

    public void loadAndPlay(SlashCommandInteraction interaction, String url) {
        GuildMusicManager guildMusicManager = this.getMusicManager(interaction.getGuild());
        this.audioPlayerManager.loadItemOrdered(
                guildMusicManager,
                url,
                new AudioLoadResultHandler() {
                    @Override
                    public void trackLoaded(AudioTrack track) {

                    }

                    @Override
                    public void playlistLoaded(AudioPlaylist playlist) {

                    }

                    @Override
                    public void noMatches() {

                    }

                    @Override
                    public void loadFailed(FriendlyException exception) {

                    }
                }
        );
    }
}
