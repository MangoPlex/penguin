package xyz.mangostudio.penguin;

import net.dv8tion.jda.api.entities.channel.concrete.StageChannel;
import net.dv8tion.jda.api.entities.channel.middleman.AudioChannel;
import net.dv8tion.jda.api.events.guild.voice.GuildVoiceUpdateEvent;
import net.dv8tion.jda.api.events.interaction.command.SlashCommandInteractionEvent;
import net.dv8tion.jda.api.events.interaction.component.ButtonInteractionEvent;
import net.dv8tion.jda.api.events.session.ReadyEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;
import net.dv8tion.jda.api.managers.AudioManager;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import xyz.mangostudio.penguin.buttons.ButtonHandler;
import xyz.mangostudio.penguin.commands.CommandHandler;
import xyz.mangostudio.penguin.lavaplayer.PlayerManager;
import xyz.mangostudio.penguin.structures.Entities;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class Listener extends ListenerAdapter {
    private static final Logger LOGGER = LoggerFactory.getLogger(Listener.class);
    private static final List<String> CHANNELS = new ArrayList<>();
    private static final CommandHandler COMMAND_HANDLER = new CommandHandler();
    private static final ButtonHandler BUTTON_HANDLER = new ButtonHandler();

    @Override
    public void onReady(@NotNull ReadyEvent event) {
        super.onReady(event);

        event.getJDA().updateCommands().addCommands(
                COMMAND_HANDLER.getEntities().stream().map(
                        Entities.Command::getApplicationCommandData
                ).collect(Collectors.toList())
        ).queue();

        LOGGER.info("Logged in as {}", event.getJDA().getSelfUser().getEffectiveName());
    }

    @Override
    public void onGuildVoiceUpdate(@NotNull GuildVoiceUpdateEvent event) {
        super.onGuildVoiceUpdate(event);

        AudioManager man = event.getGuild().getAudioManager();
        AudioChannel channel = event.getChannelJoined();
        AudioChannel leftChannel = event.getChannelLeft();
        AudioChannel joinChannel = event.getChannelJoined();

        if (leftChannel == null && joinChannel != null) {
            if (!man.isSelfDeafened()) man.setSelfDeafened(true);
            if (channel instanceof StageChannel stage) {
                stage.requestToSpeak().queue();
            }
            return;
        }
        if (leftChannel != null) {
            long memSize = leftChannel.getMembers().stream().filter(
                    (m) -> !m.getUser().isBot()
            ).count();
            if (leftChannel.getMembers().contains(event.getGuild().getSelfMember())) {
                if (event.getMember().equals(event.getGuild().getSelfMember())) {
                    PlayerManager.getInstance().getMusicManager(event.getGuild()).getAudioPlayer().destroy();
                    return;
                }

                if (memSize == 0) {
                    event.getGuild().getAudioManager().closeAudioConnection();
                }
            }
            if (joinChannel == null) {
                PlayerManager.getInstance().getMusicManager(event.getGuild()).getAudioPlayer().destroy();
                man.closeAudioConnection();
                return;
            }


            memSize = joinChannel.getMembers().stream().filter(
                    (m) -> !m.getUser().isBot()
            ).count();

            if (memSize == 0) {
                PlayerManager.getInstance().getMusicManager(event.getGuild()).getAudioPlayer().destroy();
                man.closeAudioConnection();
            }
        }
    }

    @Override
    public void onSlashCommandInteraction(@NotNull SlashCommandInteractionEvent event) {
        super.onSlashCommandInteraction(event);
        COMMAND_HANDLER.handle(event);
    }

    @Override
    public void onButtonInteraction(@NotNull ButtonInteractionEvent event) {
        super.onButtonInteraction(event);
        BUTTON_HANDLER.handle(event);
    }
}
