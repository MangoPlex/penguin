package xyz.mangostudio.penguin.commands.music;

import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.interactions.commands.SlashCommandInteraction;
import net.dv8tion.jda.api.interactions.commands.build.Commands;
import xyz.mangostudio.penguin.lavaplayer.GuildMusicManager;
import xyz.mangostudio.penguin.lavaplayer.PlayerManager;
import xyz.mangostudio.penguin.preconditions.MusicPrecondition;
import xyz.mangostudio.penguin.structures.Entities;

import java.util.List;

public class SkipCommand extends Entities.Command {
    public SkipCommand() {
        super(
                Commands.slash("skip", "Skip current song")
        );
        this.preconditions = List.of(new MusicPrecondition());
    }

    @Override
    public void run(SlashCommandInteraction interaction) {
        GuildMusicManager man = PlayerManager.getInstance().getMusicManager(interaction.getGuild());
        man.getScheduler().startTrack(false);
        interaction.replyEmbeds(
                new EmbedBuilder()
                        .setDescription("Skipped current track")
                        .build()
        ).queue();
    }
}
