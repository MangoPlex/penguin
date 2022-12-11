package xyz.mangostudio.penguin;

import net.dv8tion.jda.api.entities.channel.concrete.Category;
import net.dv8tion.jda.api.entities.channel.concrete.StageChannel;
import net.dv8tion.jda.api.entities.channel.concrete.VoiceChannel;
import net.dv8tion.jda.api.entities.channel.middleman.AudioChannel;
import net.dv8tion.jda.api.events.ReadyEvent;
import net.dv8tion.jda.api.events.guild.member.GuildMemberJoinEvent;
import net.dv8tion.jda.api.events.guild.voice.GuildVoiceJoinEvent;
import net.dv8tion.jda.api.events.guild.voice.GuildVoiceLeaveEvent;
import net.dv8tion.jda.api.events.guild.voice.GuildVoiceMoveEvent;
import net.dv8tion.jda.api.events.interaction.command.SlashCommandInteractionEvent;
import net.dv8tion.jda.api.events.interaction.component.ButtonInteractionEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;
import net.dv8tion.jda.api.managers.AudioManager;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import xyz.mangostudio.penguin.buttons.ButtonHandler;
import xyz.mangostudio.penguin.commands.CommandHandler;
import xyz.mangostudio.penguin.db.DbClient;
import xyz.mangostudio.penguin.economy.Economy;
import xyz.mangostudio.penguin.lavaplayer.PlayerManager;
import xyz.mangostudio.penguin.structures.Entities;
import xyz.mangostudio.penguin.utils.Constants;
import xyz.mangostudio.penguin.utils.Misc;

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

        new Economy(event.getJDA()).handle();

        event.getJDA().updateCommands().addCommands(
                COMMAND_HANDLER.getEntities().stream().map(
                        Entities.Command::getApplicationCommandData
                ).collect(Collectors.toList())
        ).queue();

        LOGGER.info("Logged in as {}", event.getJDA().getSelfUser().getAsTag());
    }

    @Override
    public void onGuildVoiceJoin(@NotNull GuildVoiceJoinEvent event) {
        super.onGuildVoiceJoin(event);
        if (event.getMember().getId().equalsIgnoreCase(event.getJDA().getSelfUser().getId())) {
            AudioManager man = event.getGuild().getAudioManager();
            AudioChannel channel = event.getChannelJoined();

            if (!man.isSelfDeafened()) man.setSelfDeafened(true);
            if (channel instanceof StageChannel stage) {
                stage.requestToSpeak().queue();
            }
        }
        LOGGER.debug(event.getChannelJoined().getId());
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
        long memSize = leftChannel.getMembers().size();
        if (CHANNELS.contains(leftChannel.getId()) && memSize == 0) {
            try {
                event.getGuild().getVoiceChannelById(leftChannel.getId()).delete().queue();
                CHANNELS.remove(leftChannel.getId());
            } catch (Exception ignored) {
            }
        }

        if (leftChannel.getMembers().contains(event.getGuild().getSelfMember())) {
            if (event.getMember().equals(event.getGuild().getSelfMember())) {
                PlayerManager.getInstance().getMusicManager(event.getGuild()).getAudioPlayer().destroy();
                return;
            }

            memSize = leftChannel.getMembers().stream().filter(
                    (m) -> !m.getUser().isBot()
            ).count();

            if (memSize == 0) {
                event.getGuild().getAudioManager().closeAudioConnection();
            }
        }
    }

    @Override
    public void onGuildVoiceMove(@NotNull GuildVoiceMoveEvent event) {
        super.onGuildVoiceMove(event);
        if (Constants.VOICE_PARENTS.equalsIgnoreCase(event.getChannelJoined().getId())) {
            String channelName = event.getMember().getEffectiveName() + "'s lounge";
            Category parent = event.getGuild().getCategoryById(Constants.PARENT_CATEGORY);

            VoiceChannel channel = event.getGuild().createVoiceChannel(
                    channelName, parent
            ).complete();

            event.getGuild().moveVoiceMember(event.getMember(), channel).queue();
            CHANNELS.add(channel.getId());
            return;
        }
        AudioChannel leftChannel = event.getChannelLeft();
        int memSize = leftChannel.getMembers().size();
        if (CHANNELS.contains(leftChannel.getId()) && memSize == 0) {
            try {
                event.getGuild().getVoiceChannelById(leftChannel.getId()).delete().queue();
                CHANNELS.remove(leftChannel.getId());
            } catch (Exception ignored) {
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

    @Override
    public void onGuildMemberJoin(@NotNull GuildMemberJoinEvent event) {
        super.onGuildMemberJoin(event);
        if (!event.getUser().isBot()) {
            DbClient.getDatastore().save(Misc.getDefaultSetting(event.getUser().getId()));
        }
    }
}
