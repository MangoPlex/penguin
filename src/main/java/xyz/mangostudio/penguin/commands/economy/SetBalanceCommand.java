package xyz.mangostudio.penguin.commands.economy;

import dev.morphia.query.Query;
import dev.morphia.query.experimental.filters.Filters;
import dev.morphia.query.experimental.updates.UpdateOperators;
import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.entities.User;
import net.dv8tion.jda.api.interactions.InteractionHook;
import net.dv8tion.jda.api.interactions.commands.Command;
import net.dv8tion.jda.api.interactions.commands.OptionType;
import net.dv8tion.jda.api.interactions.commands.SlashCommandInteraction;
import net.dv8tion.jda.api.interactions.commands.build.Commands;
import net.dv8tion.jda.api.interactions.commands.build.OptionData;
import xyz.mangostudio.penguin.db.DbClient;
import xyz.mangostudio.penguin.db.models.PUser;
import xyz.mangostudio.penguin.structures.Entities;
import xyz.mangostudio.penguin.utils.Constants;
import xyz.mangostudio.penguin.utils.Misc;

import java.util.List;

public class SetBalanceCommand extends Entities.Command {
    public SetBalanceCommand() {
        super(
                Commands.slash("setbalance", "Set balance of a user")
                        .addOptions(
                                new OptionData(OptionType.USER, "user", "User to view balance", true),
                                new OptionData(OptionType.INTEGER, "amount", "Amount to set", true),
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

        int amount = interaction.getOption("amount").getAsInt();

        Query<PUser> userQuery = DbClient.getDatastore().find(PUser.class)
                .filter(Filters.eq("uid", user.getId()));

        List<PUser> users = userQuery.stream().toList();

        EmbedBuilder embed = new EmbedBuilder()
                .setTitle("MangoCoin™️");

        if (users.isEmpty()) {
            DbClient.getDatastore().insert(Misc.getDefaultSetting(user.getId()));
            userQuery.update(
                    UpdateOperators.set("balance", 0)
            ).execute();
        }

        userQuery = DbClient.getDatastore().find(PUser.class)
                .filter(Filters.eq("uid", user.getId()));

        users = userQuery.stream().toList();

        String operation = interaction.getOption("operation").getAsString();
        PUser selectedUser = users.get(0);
        switch (operation) {
            case "add" -> {
                selectedUser.addBalance(amount);
                embed.setDescription(amount + "MGC have been added to " + user.getAsTag());
            }
            case "subtract" -> {
                selectedUser.subtractBalance(amount);
                embed.setDescription(amount + "MGC have been taken away from " + user.getAsTag());
            }
            case "set" -> {
                selectedUser.setBalance(amount);
                embed.setDescription(user.getAsTag() + "'s balance has been set to " + amount + "MGC");
            }
        }

        hook.editOriginalEmbeds(embed.build()).queue();
    }
}
