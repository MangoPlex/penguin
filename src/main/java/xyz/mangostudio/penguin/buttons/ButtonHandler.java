package xyz.mangostudio.penguin.buttons;

import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.events.interaction.component.ButtonInteractionEvent;
import net.dv8tion.jda.api.interactions.InteractionHook;
import xyz.mangostudio.penguin.buttons.buttons.QueueButton;
import xyz.mangostudio.penguin.structures.Entities;
import xyz.mangostudio.penguin.structures.Handler;

public class ButtonHandler extends Handler<Entities.Button> {
    public ButtonHandler() {
        super();
        this.addToEntities(
                new QueueButton()
        );
    }

    public void handle(ButtonInteractionEvent event) {
        if (!event.isFromGuild()) return;
        InteractionHook hook = event.deferEdit().complete();

        Entities.Button button = null;

        for (Entities.Button btn : this.getEntities()) {
            if (btn.getButtonIds().contains(event.getInteraction().getButton().getId())) {
                button = btn;
                break;
            }
        }

        if (button == null) {
            hook.editOriginalEmbeds(
                    new EmbedBuilder()
                            .setDescription("Invalid button")
                            .build()
            ).queue();
            return;
        }

        button.run(hook);
    }
}
