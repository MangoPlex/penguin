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
import xyz.mangostudio.penguin.lavaplayer.GuildMusicManager;
import xyz.mangostudio.penguin.lavaplayer.PlayerManager;
import xyz.mangostudio.penguin.structures.Entities;

import java.util.stream.Collectors;

public class Listener extends ListenerAdapter {
    private static final Logger LOGGER = LoggerFactory.getLogger(Listener.class);
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
        GuildMusicManager gm = PlayerManager.getInstance().getMusicManager(leftChannel.getGuild());

        if (joinChannel != null) {
            if (!man.isSelfDeafened()) man.setSelfDeafened(true);
            if (channel instanceof StageChannel stage) {
                stage.requestToSpeak().queue();
            }
        }
        if (joinChannel == null) {
            if (leftChannel.getMembers().contains(leftChannel.getGuild().getSelfMember())) {
                if (
                        leftChannel.getMembers().stream().allMatch((m) -> m.getUser().isBot()) ||
                        event.getMember().equals(event.getGuild().getSelfMember())
                ) {
                    man.closeAudioConnection();
                    gm.getAudioPlayer().destroy();
                }
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
