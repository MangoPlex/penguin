package xyz.mangostudio.penguin.commands.misc;

import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.entities.User;
import net.dv8tion.jda.api.interactions.commands.OptionType;
import net.dv8tion.jda.api.interactions.commands.SlashCommandInteraction;
import net.dv8tion.jda.api.interactions.commands.build.Commands;
import xyz.mangostudio.penguin.structures.Command;

public class AvatarCommand extends Command {
    public AvatarCommand() {
        super(
                Commands.slash("avatar", "Check user's avatar")
                        .addOption(OptionType.USER, "user", "The user to get the avatar", false)
        );
    }

    @Override
    public void run(SlashCommandInteraction interaction) {
        User user =
                interaction.getOption("user") == null ?
                        interaction.getUser() : interaction.getOption("user").getAsUser();

        interaction.replyEmbeds(
                new EmbedBuilder()
                        .setTitle(user.getName() + "'s avatar")
                        .setImage(user.getAvatarUrl())
                        .build()
        ).queue();

    }
}
