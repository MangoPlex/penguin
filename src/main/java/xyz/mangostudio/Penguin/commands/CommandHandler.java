package xyz.mangostudio.Penguin.commands;

import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.events.interaction.command.SlashCommandInteractionEvent;
import xyz.mangostudio.Penguin.commands.crypto.CoinCommand;
import xyz.mangostudio.Penguin.commands.info.PingCommand;
import xyz.mangostudio.Penguin.structures.Command;
import xyz.mangostudio.Penguin.structures.Precondition;

import java.awt.*;
import java.util.ArrayList;
import java.util.List;

public class CommandHandler {
    public final List<Command> commands = new ArrayList<>();

    public CommandHandler() {
        addCommand(new PingCommand());
        addCommand(new CoinCommand());
    }

    private void addCommand(Command... cmd) {
        commands.addAll(List.of(cmd));
    }

    public void handle(SlashCommandInteractionEvent event) {
        Command cmd = null;
        for (Command c : commands) {
            if (c.applicationCommandData.getName().equalsIgnoreCase(event.getName())) {
                cmd = c;
                break;
            }
        }
        if (cmd == null) {
            event.replyEmbeds(
                    new EmbedBuilder()
                            .setColor(Color.RED)
                            .setDescription("Invalid command")
                            .build()
            ).queue();
            return;
        }

        if (!cmd.preconditions.isEmpty()) {
            for (Precondition precondition : cmd.preconditions) {
                if (!precondition.run(event.getInteraction())) return;
            }
        }

        cmd.run(event.getInteraction());
    }
}
