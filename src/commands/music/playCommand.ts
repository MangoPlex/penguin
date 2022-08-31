import { Description } from "@discordx/utilities";
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";

@Discord()
export default class PlayCommand {
    @Slash({ name: "play" })
    @Description("Play music")
    public async play(
        @SlashOption({
            name: "url",
            description: "Url or keyword of the track",
            required: true,
            type: ApplicationCommandOptionType.String
        })
        url: string,
        interaction: CommandInteraction
    ): Promise<void> {
        await interaction.deferReply();
        const lavalink = interaction.client.lavalink;
        let player = lavalink?.getPlayer(interaction.guildId!);
        const member = await interaction.guild?.members.fetch(interaction.user.id);
        const memState = member?.voice;
        const botState = interaction.guild?.members.me?.voice!;

        if (!memState?.channel) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
                        .setDescription("No voice channel detected")
                ]
            });
            return;
        } else {
            if (!botState.channel || !player) player = lavalink?.createPlayer(interaction.guildId!);
            else if (memState.channelId !== player.channelId) {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Red")
                            .setDescription("Please join the same channel with the bot")
                    ]
                });
                return;
            }
        }

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
                        new EmbedBuilder()
                            .setDescription(`Added **${track.info.title}** to queue`)
                    ]
                });
                break;
            case "PLAYLIST_LOADED":
                player?.queue.add(res.tracks, { requester: interaction.user.id });
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`Added playlist **${res.playlistInfo.name}** to queue`)
                    ]
                });
                break;
            case "NO_MATCHES":
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
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