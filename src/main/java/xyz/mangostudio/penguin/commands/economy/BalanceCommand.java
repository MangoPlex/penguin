package xyz.mangostudio.penguin.commands.economy;

import dev.morphia.query.Query;
import dev.morphia.query.experimental.filters.Filters;
import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.entities.User;
import net.dv8tion.jda.api.interactions.InteractionHook;
import net.dv8tion.jda.api.interactions.commands.OptionMapping;
import net.dv8tion.jda.api.interactions.commands.OptionType;
import net.dv8tion.jda.api.interactions.commands.SlashCommandInteraction;
import net.dv8tion.jda.api.interactions.commands.build.Commands;
import xyz.mangostudio.penguin.db.DbClient;
import xyz.mangostudio.penguin.db.models.PUser;
import xyz.mangostudio.penguin.structures.Entities;
import xyz.mangostudio.penguin.utils.Misc;

import java.util.List;

public class BalanceCommand extends Entities.Command {
    public BalanceCommand() {
        super(
                Commands.slash("balance", "Show balance of a user")
                        .addOption(OptionType.USER, "user", "User to view balance", false)
        );
    }

    @Override
    public void run(SlashCommandInteraction interaction) {
        InteractionHook hook = interaction.deferReply().complete();
        OptionMapping mapping = interaction.getOption("user");
        User user = mapping == null ? interaction.getUser() : mapping.getAsUser();

        Query<PUser> userQuery = DbClient.getDatastore().find(PUser.class)
                .filter(Filters.eq("uid", user.getId()));

        List<PUser> users = userQuery.stream().toList();

        double balance;
        if (users.isEmpty()) {
            DbClient.getDatastore().insert(Misc.getDefaultSetting(user.getId()));
            balance = 0;
        } else balance = users.get(0).getBalance();

        hook.editOriginalEmbeds(
                new EmbedBuilder()
                        .setTitle("MangoCoin™️")
                        .setDescription("Your balance: " + balance + "MGC")
                        .build()
        ).queue();
    }
}
