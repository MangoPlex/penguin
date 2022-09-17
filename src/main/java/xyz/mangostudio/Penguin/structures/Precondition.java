package xyz.mangostudio.Penguin.structures;

import net.dv8tion.jda.api.interactions.commands.SlashCommandInteraction;

public abstract class Precondition {
    public abstract boolean run(SlashCommandInteraction interaction);
}
