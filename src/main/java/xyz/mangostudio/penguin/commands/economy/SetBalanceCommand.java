package xyz.mangostudio.penguin.commands.economy;

import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.interactions.InteractionHook;
import net.dv8tion.jda.api.interactions.commands.OptionType;
import net.dv8tion.jda.api.interactions.commands.SlashCommandInteraction;
import net.dv8tion.jda.api.interactions.commands.build.Commands;
import xyz.mangostudio.penguin.structures.Entities;

public class SetBalanceCommand extends Entities.Command {
    public SetBalanceCommand() {
        super(
                Commands.slash("setbalance", "Set balance of a user")
                        .addOption(OptionType.USER, "user", "User to view balance", true)
                        .addOption(OptionType.INTEGER, "amount", "Amount to set", true)
        );
    }

    @Override
    public void run(SlashCommandInteraction interaction) {
        InteractionHook hook = interaction.deferReply().complete();
        if (!interaction.getMember().getId().equalsIgnoreCase("490107873834303488")) {
            hook.editOriginalEmbeds(
                    new EmbedBuilder()
                            .setTitle("MangoCoin™️")
                            .setDescription("You don't have permission to use this")
                            .build()
            ).queue();
            return;
        }
    }
}
