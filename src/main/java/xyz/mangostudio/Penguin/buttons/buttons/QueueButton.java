package xyz.mangostudio.penguin.buttons.buttons;

import com.sedmelluq.discord.lavaplayer.track.AudioTrack;
import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.entities.Member;
import net.dv8tion.jda.api.entities.MessageEmbed;
import net.dv8tion.jda.api.interactions.InteractionHook;
import org.apache.commons.collections4.ListUtils;
import xyz.mangostudio.penguin.lavaplayer.GuildMusicManager;
import xyz.mangostudio.penguin.lavaplayer.PlayerManager;
import xyz.mangostudio.penguin.structures.Button;

import java.util.List;

public class QueueButton extends Button {
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
        if (hook.getInteraction().getId().equalsIgnoreCase("queue-close-page"))
            hook.deleteOriginal().queue();
        if (hook.getInteraction().getId().equalsIgnoreCase("queue-prev-page")) {
            this.queuePrevPage(hook);
        }
        if (hook.getInteraction().getId().equalsIgnoreCase("queue-next-page")) {
            this.queueNextPage();Page(hook);
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
        MessageEmbed embed;
        try {
            embed = this.renderEmbed(hook, this.page);
        } catch (NullPointerException e) {
            e.printStackTrace();
            return;
        }
    }

    private MessageEmbed renderEmbed(InteractionHook hook, int page) throws NullPointerException {
        List<AudioTrack> chosen = this.divQueue.get(page);

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
