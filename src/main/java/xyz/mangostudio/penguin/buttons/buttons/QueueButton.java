package xyz.mangostudio.penguin.buttons.buttons;

import com.sedmelluq.discord.lavaplayer.track.AudioTrack;
import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.entities.Member;
import net.dv8tion.jda.api.entities.MessageEmbed;
import net.dv8tion.jda.api.interactions.InteractionHook;
import net.dv8tion.jda.api.interactions.components.buttons.Button;
import net.dv8tion.jda.api.interactions.components.buttons.ButtonInteraction;
import org.apache.commons.collections4.ListUtils;
import xyz.mangostudio.penguin.lavaplayer.GuildMusicManager;
import xyz.mangostudio.penguin.lavaplayer.PlayerManager;
import xyz.mangostudio.penguin.structures.Entities;

import java.util.List;

public class QueueButton extends Entities.Button {
    private int page = 0;
    private List<AudioTrack> queue;
    private List<List<AudioTrack>> divQueue;

    public QueueButton() {
        super();
        this.addButtonIds(
                "queue-prev-page",
                "queue-next-page",
                "queue-close-page"
        );
    }

    @Override
    public void run(InteractionHook hook) {
        GuildMusicManager manager = PlayerManager.getInstance().getMusicManager(hook.getInteraction().getGuild());
        this.queue = manager.getScheduler().getQueue();
        this.divQueue = ListUtils.partition(this.queue, 5);
        Button btn = ((ButtonInteraction) hook.getInteraction()).getButton();
        if (btn.getId().equalsIgnoreCase("queue-close-page")) {
            hook.deleteOriginal().queue();
            this.page = 0;
        }
        if (btn.getId().equalsIgnoreCase("queue-prev-page")) {
            this.queuePrevPage(hook);
        }
        if (btn.getId().equalsIgnoreCase("queue-next-page")) {
            this.queueNextPage(hook);
        }
    }

    private void queuePrevPage(InteractionHook hook) {
        this.page--;
        this.updateView(hook);
    }

    private void queueNextPage(InteractionHook hook) {
        this.page++;
        this.updateView(hook);
    }

    private void updateView(InteractionHook hook) {
        MessageEmbed embed = this.renderEmbed(hook);
        hook
                .editOriginalEmbeds(embed)
                .setActionRow(
                        Button.primary("queue-prev-page", "⏮️")
                                .withDisabled(this.page == 0),
                        Button.primary("queue-next-page", "⏭️")
                                .withDisabled(this.page == this.divQueue.size() - 1),
                        Button.primary("queue-close-page", "❎")
                )
                .queue();
    }

    private MessageEmbed renderEmbed(InteractionHook hook) {
        List<AudioTrack> chosen;
        try {
            chosen = this.divQueue.get(this.page);
        } catch (IndexOutOfBoundsException e) {
            e.printStackTrace();
            chosen = this.divQueue.get(0);
            this.page = 0;
        }

        EmbedBuilder embed = new EmbedBuilder()
                .setTitle("Queue")
                .setDescription("Page " + (this.page + 1) + "/" + this.divQueue.size());

        chosen.forEach((track) -> {
            Member member = hook.getInteraction().getGuild().getMemberById(track.getUserData(String.class));
            embed.addField(
                    (queue.indexOf(track) + 1) + ". " + track.getInfo().title,
                    "Requested by: " + member.getUser().getAsTag(),
                    false
            );
        });

        return embed.build();
    }
}
