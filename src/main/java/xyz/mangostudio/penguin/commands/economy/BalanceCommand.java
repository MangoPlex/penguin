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

        PUser pUser = userQuery.first();

        hook.editOriginalEmbeds(
                new EmbedBuilder()
                        .setTitle("MangoCoin™️")
                        .setDescription("Your balance: " + pUser.getBalance() + "MGC")
                        .build()
        ).queue();
    }
}
