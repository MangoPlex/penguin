package xyz.mangostudio.Penguin.structures;

import net.dv8tion.jda.api.interactions.commands.SlashCommandInteraction;
import net.dv8tion.jda.api.interactions.commands.build.CommandData;

import java.util.List;

public abstract class Command {
    public CommandData applicationCommandData = null;
    public List<Precondition> preconditions = List.of();

    public abstract void run(SlashCommandInteraction interaction);
}
