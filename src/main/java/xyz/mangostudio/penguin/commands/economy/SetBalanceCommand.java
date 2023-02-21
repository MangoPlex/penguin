package xyz.mangostudio.penguin.commands.economy;

import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.entities.User;
import net.dv8tion.jda.api.interactions.InteractionHook;
import net.dv8tion.jda.api.interactions.commands.Command;
import net.dv8tion.jda.api.interactions.commands.OptionType;
import net.dv8tion.jda.api.interactions.commands.SlashCommandInteraction;
import net.dv8tion.jda.api.interactions.commands.build.Commands;
import net.dv8tion.jda.api.interactions.commands.build.OptionData;
import xyz.mangostudio.penguin.db.models.PUser;
import xyz.mangostudio.penguin.structures.Entities;
import xyz.mangostudio.penguin.utils.Constants;

public class SetBalanceCommand extends Entities.Command {
    public SetBalanceCommand() {
        super(
                Commands.slash("setbalance", "Set balance of a user")
                        .addOptions(
                                new OptionData(OptionType.USER, "user", "User to view balance", true),
                                new OptionData(OptionType.NUMBER, "amount", "Amount to set", true),
                                new OptionData(OptionType.STRING, "operation", "Action to take on user's balance", true)
                                        .addChoices(
                                                new Command.Choice("add", "add"),
                                                new Command.Choice("subtract", "subtract"),
                                                new Command.Choice("set", "set")
                                        )
                        )
        );
    }

    @Override
    public void run(SlashCommandInteraction interaction) {
        InteractionHook hook = interaction.deferReply().complete();
        if (!Constants.OWNERS.contains(interaction.getMember().getId())) {
            hook.editOriginalEmbeds(
                    new EmbedBuilder()
                            .setTitle("MangoCoin™️")
                            .setDescription("You don't have permission to use this")
                            .build()
            ).queue();
            return;
        }

        User user = interaction.getOption("user").getAsUser();

        if (user.isBot()) {
            hook.editOriginalEmbeds(
                    new EmbedBuilder()
                            .setTitle("MangoCoin™️")
                            .setDescription("You can't use this command on bots")
                            .build()
            ).queue();
            return;
        }

        double amount = interaction.getOption("amount").getAsDouble();

        PUser pUser = PUser.getUser(user.getId());

        EmbedBuilder embed = new EmbedBuilder()
                .setTitle("MangoCoin™️");

        String operation = interaction.getOption("operation").getAsString();
        switch (operation) {
            case "add" -> {
                pUser.addBalance(amount);
                embed.setDescription(amount + "MGC have been added to " + user.getAsTag());
            }
            case "subtract" -> {
                pUser.subtractBalance(amount);
                embed.setDescription(amount + "MGC have been taken away from " + user.getAsTag());
            }
            case "set" -> {
                pUser.setBalance(amount);
                embed.setDescription(user.getAsTag() + "'s balance has been set to " + amount + "MGC");
            }
        }

        hook.editOriginalEmbeds(embed.build()).queue();
    }
}
