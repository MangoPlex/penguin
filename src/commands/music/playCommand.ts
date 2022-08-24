import { Description } from "@discordx/utilities";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";

@Discord()
export default class PlayCommand {
    @Slash("play")
    @Description("Play music")
    public async play(
        @SlashOption("url", {
            description: "Url or keyword of the track",
            required: true,
            type: "STRING"
        })
        url: string,
        interaction: CommandInteraction
    ): Promise<void> {
        await interaction.deferReply();
        const botState = interaction.guild?.me?.voice;
        const member = await interaction.guild?.members.fetch(interaction.user.id);
        const memberState = member?.voice;
        const lavalink = interaction.client.lavalink;

        if (!memberState?.channelId) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription("Please join a voice channel first")
                ]
            });
            return;
        }
        


        let player;

        if (botState?.channelId && player) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription("The bot is busy at another channel")
                ]
            });
            return;
        }

        if (botState?.channelId && !player)
            player = lavalink?.getPlayer(interaction.guildId as string);

        if (!botState?.channelId) {
            player = lavalink?.createPlayer(
                interaction.guildId as string
            );
            player?.connect(memberState.channelId, { deafened: true });
        }

        let res;

        if (this.checkUrl(url))
            res = await lavalink?.rest?.loadTracks(url);
        else res = await lavalink?.rest?.loadTracks(`scsearch:${url}`);

        switch (res?.loadType) {
            case "SEARCH_RESULT":
            case "TRACK_LOADED":
                const track = res.tracks[0];
                player?.queue.add(track, { requester: interaction.user.tag });
                await interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`Added **${track.info.title}** to queue`)
                    ]
                });
                break;
            case "PLAYLIST_LOADED":
                player?.queue.add(res.tracks, { requester: interaction.user.tag });
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

        if (!player?.queue.current)
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
}