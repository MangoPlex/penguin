import { ChatInputCommand, Command } from "@sapphire/framework";
import { MessageEmbed } from "discord.js";

export class PlayCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, { ...options });
    }

    public async play(interaction: Command.ChatInputInteraction): Promise<void> {
        await interaction.deferReply();
        const lavalink = interaction.client.lavalink;
        let player = lavalink?.getPlayer(interaction.guildId!);
        const member = await interaction.guild?.members.fetch(interaction.user.id);
        const memState = member?.voice;
        const botState = interaction.guild?.me?.voice!;

        if (!memState?.channel) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor("RED")
                        .setDescription("No voice channel detected")
                ]
            });
            return;
        } else {
            if (!botState.channel || !player) player = lavalink?.createPlayer(interaction.guildId!);
            else if (memState.channelId !== player.channelId) {
                await interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setColor("RED")
                            .setDescription("Please join the same channel with the bot")
                    ]
                });
                return;
            }
        }

        const url = interaction.options.getString("url")!;

        let res;

        if (this.checkUrl(url))
            res = await lavalink?.rest?.loadTracks(url);
        else res = await lavalink?.rest?.loadTracks(`scsearch:${url}`);

        switch (res?.loadType) {
            case "SEARCH_RESULT":
            case "TRACK_LOADED":
                const track = res.tracks[0];
                player?.queue.add(track, { requester: interaction.user.id });
                await interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`Added **${track.info.title}** to queue`)
                    ]
                });
                break;
            case "PLAYLIST_LOADED":
                player?.queue.add(res.tracks, { requester: interaction.user.id });
                await interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`Added playlist **${res.playlistInfo.name}** to queue`)
                    ]
                });
                break;
            case "NO_MATCHES":
                await interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`Not found`)
                    ]
                });
                break;
        }

        if (!player?.connected) player?.connect(memState.channelId);

        if (!player?.trackData)
            await player?.queue.start();
    }

    private checkUrl(string: string): boolean {
        try {
            new URL(string);
            return true;
        } catch (e) {
            return false;
        }
    }

    public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder.setName("play").setDescription("Play music")
                .addStringOption((input) => input.setName("url").setDescription("Url/keyword of the track"))
        );
    }
}