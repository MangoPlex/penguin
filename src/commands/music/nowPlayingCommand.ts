import { Description } from "@discordx/utilities";
import { CommandInteraction, MessageEmbed, User } from "discord.js";
import { Discord, Slash } from "discordx";

@Discord()
export default class NowPlayingCommand {
    @Slash("nowplaying")
    @Description("Show the now playing track")
    public async nowPlaying(interaction: CommandInteraction): Promise<void> {
        const player = interaction.client.lavalink?.getPlayer(interaction.guildId!);
        if (!player || (player && !player.queue.current)) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription("No current song")
                ]
            });
            return;
        }
        const current = player.queue.current;
        const requester = (await interaction.guild?.members.fetch(current?.requester!))?.user;
        await interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Now Playing")
                    .addField(current?.title!, `Requested by ${requester?.tag!}`, false)
            ]
        });
    }
}