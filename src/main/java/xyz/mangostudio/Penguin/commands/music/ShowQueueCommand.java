package xyz.mangostudio.penguin.commands.music;

import com.sedmelluq.discord.lavaplayer.track.AudioTrack;
import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.entities.Member;
import net.dv8tion.jda.api.interactions.commands.SlashCommandInteraction;
import net.dv8tion.jda.api.interactions.commands.build.Commands;
import net.dv8tion.jda.api.interactions.components.buttons.Button;
import org.apache.commons.collections4.ListUtils;
import xyz.mangostudio.penguin.lavaplayer.PlayerManager;
import xyz.mangostudio.penguin.preconditions.MusicPrecondition;
import xyz.mangostudio.penguin.structures.Entities;

import java.util.List;

public class ShowQueueCommand extends Entities.Command {
    public ShowQueueCommand() {
        super(Commands.slash("queue", "View the queue"));
        this.preconditions = List.of(new MusicPrecondition());
    }

    @Override
    public void run(SlashCommandInteraction interaction) {
        List<AudioTrack> queue = PlayerManager.getInstance()
                .getMusicManager(interaction.getGuild())
                .getScheduler()
                .getQueue();

        if (queue.isEmpty()) {
            interaction.replyEmbeds(
                    new EmbedBuilder()
                            .setDescription("Empty queue")
                            .build()
            ).queue();
            return;
        }

        List<List<AudioTrack>> divQueue = ListUtils.partition(queue, 5);
        List<AudioTrack> chosen = divQueue.get(0);
        EmbedBuilder embed = new EmbedBuilder()
                .setTitle("Queue")
                .setDescription("Page: 1/" + chosen.size());

        chosen.forEach((track) -> {
            Member member = interaction.getGuild().getMemberById(track.getUserData(String.class));
            embed.addField(
                    (queue.indexOf(track) + 1) + ". " + track.getInfo().title,
                    "Requested by: " + member.getUser().getAsTag(),
                    false
            );
        });

        interaction
                .replyEmbeds(embed.build())
                .addActionRow(
                        Button.primary("queue-prev-page", "⏮️")
                                .withDisabled(true),
                        Button.primary("queue-next-page", "⏭️")
                                .withDisabled(divQueue.size() == 1),
                        Button.primary("queue-close-page", "❎")
                )
                .queue();
    }
}
