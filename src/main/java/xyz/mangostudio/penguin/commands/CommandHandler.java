package xyz.mangostudio.penguin.commands;

import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.events.interaction.command.SlashCommandInteractionEvent;
import xyz.mangostudio.penguin.commands.crypto.CoinCommand;
import xyz.mangostudio.penguin.commands.info.PingCommand;
import xyz.mangostudio.penguin.commands.misc.AvatarCommand;
import xyz.mangostudio.penguin.commands.misc.RollCommand;
import xyz.mangostudio.penguin.commands.music.PlayCommand;
import xyz.mangostudio.penguin.commands.music.QueueCommand;
import xyz.mangostudio.penguin.structures.Entities;
import xyz.mangostudio.penguin.structures.Handler;

public class CommandHandler extends Handler<Entities.Command> {
    public CommandHandler() {
        super();
        this.addToEntities(
                new PingCommand(),
                new CoinCommand(),
                new PlayCommand(),
                new AvatarCommand(),
                new RollCommand(),
                new QueueCommand()
        );
    }

    public void handle(SlashCommandInteractionEvent event) {
        if (!event.isFromGuild()) return;
        Entities.Command cmd = null;
        for (Entities.Command c : this.getEntities()) {
            if (c.getApplicationCommandData().getName().equalsIgnoreCase(event.getName())) {
                cmd = c;
                break;
            }
        }
        if (cmd == null) {
            event.replyEmbeds(
                    new EmbedBuilder()
                            .setDescription("Invalid command")
                            .build()
            ).queue();
            return;
        }

        if (!cmd.preconditions.isEmpty()) {
            for (Entities.Precondition precondition : cmd.preconditions) {
                if (!precondition.run(event.getInteraction())) return;
            }
        }

        cmd.run(event.getInteraction());
    }
}
