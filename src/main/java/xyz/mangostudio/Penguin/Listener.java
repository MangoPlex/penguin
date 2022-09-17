package xyz.mangostudio.Penguin;

import net.dv8tion.jda.api.entities.channel.concrete.Category;
import net.dv8tion.jda.api.entities.channel.concrete.VoiceChannel;
import net.dv8tion.jda.api.entities.channel.middleman.AudioChannel;
import net.dv8tion.jda.api.events.ReadyEvent;
import net.dv8tion.jda.api.events.guild.voice.GuildVoiceJoinEvent;
import net.dv8tion.jda.api.events.guild.voice.GuildVoiceLeaveEvent;
import net.dv8tion.jda.api.events.interaction.command.SlashCommandInteractionEvent;
import net.dv8tion.jda.api.events.interaction.component.ButtonInteractionEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import xyz.mangostudio.Penguin.commands.CommandHandler;
import xyz.mangostudio.Penguin.economy.Economy;
import xyz.mangostudio.Penguin.utils.Constants;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class Listener extends ListenerAdapter {
    private static final Logger LOGGER = LoggerFactory.getLogger(Listener.class);
    private static final List<String> CHANNELS = new ArrayList<>();

    private final CommandHandler commandHandler = new CommandHandler();

    @Override
    public void onReady(@NotNull ReadyEvent event) {
        super.onReady(event);

        new Economy(event.getJDA()).handle();

        event.getJDA().updateCommands().addCommands(
                commandHandler.commands.stream().map(
                        (command) -> command.applicationCommandData
                ).collect(Collectors.toList())
        ).queue();

        LOGGER.info("Logged in as {}", event.getJDA().getSelfUser().getAsTag());
    }

    @Override
    public void onGuildVoiceJoin(@NotNull GuildVoiceJoinEvent event) {
        super.onGuildVoiceJoin(event);
        if (Constants.VOICE_PARENTS.equalsIgnoreCase(event.getChannelJoined().getId())) {
            String channelName = event.getMember().getEffectiveName() + "'s lounge";
            Category parent = event.getGuild().getCategoryById(Constants.PARENT_CATEGORY);

            VoiceChannel channel = event.getGuild().createVoiceChannel(
                    channelName, parent
            ).complete();

            event.getGuild().moveVoiceMember(event.getMember(), channel).queue();
            CHANNELS.add(channel.getId());
        }
    }

    @Override
    public void onGuildVoiceLeave(@NotNull GuildVoiceLeaveEvent event) {
        super.onGuildVoiceLeave(event);
        AudioChannel leftChannel = event.getChannelLeft();
        int memSize = leftChannel.getMembers().size();
        if (CHANNELS.contains(leftChannel.getId()) && memSize == 0) {
            try {
                event.getGuild().getVoiceChannelById(leftChannel.getId()).delete().queue();
            } catch (Exception ignored) {
            }
        }
    }

    @Override
    public void onSlashCommandInteraction(@NotNull SlashCommandInteractionEvent event) {
        super.onSlashCommandInteraction(event);
        if (event.getGuild() != null) new CommandHandler().handle(event);
    }

    @Override
    public void onButtonInteraction(@NotNull ButtonInteractionEvent event) {
        super.onButtonInteraction(event);

    }
}
