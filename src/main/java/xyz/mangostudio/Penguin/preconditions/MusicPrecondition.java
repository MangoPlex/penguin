package xyz.mangostudio.penguin.preconditions;

import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.entities.GuildVoiceState;
import net.dv8tion.jda.api.interactions.commands.SlashCommandInteraction;
import xyz.mangostudio.penguin.structures.Entities;

public class MusicPrecondition extends Entities.Precondition {
    @Override
    public boolean run(SlashCommandInteraction interaction) {
        GuildVoiceState userState = interaction.getMember().getVoiceState();
        GuildVoiceState botState = interaction.getGuild().getSelfMember().getVoiceState();

        if (!userState.inAudioChannel()) {
            interaction.replyEmbeds(
                    new EmbedBuilder()
                            .setDescription("Please connect to a voice channel")
                            .build()
            ).queue();
            return false;
        }

        if (!botState.getChannel().getId().equalsIgnoreCase(userState.getChannel().getId())) {
            interaction.replyEmbeds(
                    new EmbedBuilder()
                            .setDescription("Please connect to the same voice channel with the bot")
                            .build()
            ).queue();
            return false;
        }
        return true;
    }
}
