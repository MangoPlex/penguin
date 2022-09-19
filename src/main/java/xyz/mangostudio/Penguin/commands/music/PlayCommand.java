package xyz.mangostudio.Penguin.commands.music;

import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.entities.GuildVoiceState;
import net.dv8tion.jda.api.entities.channel.concrete.StageChannel;
import net.dv8tion.jda.api.interactions.InteractionHook;
import net.dv8tion.jda.api.interactions.commands.OptionType;
import net.dv8tion.jda.api.interactions.commands.SlashCommandInteraction;
import net.dv8tion.jda.api.interactions.commands.build.Commands;
import xyz.mangostudio.Penguin.lavaplayer.PlayerManager;
import xyz.mangostudio.Penguin.structures.Command;

import java.net.MalformedURLException;
import java.net.URL;

public class PlayCommand extends Command {
    public PlayCommand() {
        super(
                Commands.slash("play", "Play music")
                        .addOption(OptionType.STRING, "url", "Url of the track", true)
        );
    }

    @Override
    public void run(SlashCommandInteraction interaction) {
        InteractionHook hook = interaction.deferReply().complete();
        GuildVoiceState userState = interaction.getMember().getVoiceState();
        GuildVoiceState botState = interaction.getGuild().getSelfMember().getVoiceState();

        if (!userState.inAudioChannel()) {
            hook.editOriginalEmbeds(
                    new EmbedBuilder()
                            .setDescription("Please connect to a voice channel")
                            .build()
            ).queue();
        } else if (!botState.inAudioChannel()) {
            interaction.getGuild().getAudioManager().openAudioConnection(
                    userState.getChannel()
            );
            if (userState instanceof StageChannel stage) {
                interaction.getGuild().getAudioManager().openAudioConnection(
                        stage
                );
            }
        } else if (!botState.getChannel().getId().equalsIgnoreCase(userState.getChannel().getId())) {
            hook.editOriginalEmbeds(
                    new EmbedBuilder()
                            .setDescription("Please connect to the same voice channel with the bot")
                            .build()
            ).queue();
        }

        String url = interaction.getOption("url").getAsString();

        if (!isUrl(url)) url = "ytsearch:" + url;
        PlayerManager.getInstance().loadAndPlay(hook, url, hook.getInteraction().getUser());
    }

    private boolean isUrl(String str) {
        try {
            new URL(str);
            return true;
        } catch (MalformedURLException e) {
            return false;
        }
    }
}
