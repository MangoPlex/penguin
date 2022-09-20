package xyz.mangostudio.penguin.commands.misc;

import net.dv8tion.jda.api.interactions.commands.OptionType;
import net.dv8tion.jda.api.interactions.commands.SlashCommandInteraction;
import net.dv8tion.jda.api.interactions.commands.build.Commands;
import xyz.mangostudio.penguin.structures.Entities;

public class RollCommand extends Entities.Command {
    public RollCommand() {
        super(
                Commands.slash("roll", "Roll a random number")
                        .addOption(OptionType.INTEGER, "min", "The minimum number to roll", false)
                        .addOption(OptionType.INTEGER, "max", "The maximum number to roll", false)
        );
    }

    @Override
    public void run(SlashCommandInteraction interaction) {
        int min = interaction.getOption("min") == null ? 1 : interaction.getOption("min").getAsInt();
        int max = interaction.getOption("max") == null ? 100 : interaction.getOption("max").getAsInt();

        if (min < 1 || max < min) {
            interaction.reply(
                    "The minimum number must be greater than 0 or the maximum number must be greater than the minimum number"
            ).setEphemeral(true).queue();
            return;
        }

        double roll = Math.floor(Math.random() * (max - min + 1)) + min;

        if (roll == 727) {
            interaction.reply(
                    "You rolled a 727, this is your rewards: <https://youtu.be/xvFZjo5PgG0>"
            ).queue();
            return;
        }
        interaction.reply(
                "You rolled a " + roll
        ).queue();
    }
}
