package xyz.mangostudio.penguin.commands.music;

import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.interactions.commands.SlashCommandInteraction;
import net.dv8tion.jda.api.interactions.commands.build.Commands;
import xyz.mangostudio.penguin.lavaplayer.GuildMusicManager;
import xyz.mangostudio.penguin.lavaplayer.PlayerManager;
import xyz.mangostudio.penguin.structures.Entities;

public class ClearCommand extends Entities.Command {
    public ClearCommand() {
        super(
                Commands.slash("clear", "Clear the queue")
        );
    }

    @Override
    public void run(SlashCommandInteraction interaction) {
        GuildMusicManager man = PlayerManager.getInstance().getMusicManager(interaction.getGuild());
        man.getScheduler().getQueue().clear();
        man.getAudioPlayer().stopTrack();
        interaction.replyEmbeds(
                new EmbedBuilder()
                        .setDescription("Queue cleared")
                        .build()
        ).queue();
    }
}
