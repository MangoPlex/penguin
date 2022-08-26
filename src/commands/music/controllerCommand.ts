import { Description } from "@discordx/utilities";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { Discord, Slash } from "discordx";
import TimeUtils from "../../util/timeUtils.js";

@Discord()
export default class ControllerCommand {
    @Slash("controller")
    @Description("Control the music player")
    public async nowPlaying(interaction: CommandInteraction): Promise<void> {
        const player = interaction.client.lavalink?.getPlayer(interaction.guildId!);
        if (!player || (player && !player.queue.current)) {
            await interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription("No current song")
                ]
            });
            return;
        }
        const current = player.queue.current;
        const requester = (await interaction.guild?.members.fetch(current?.requester!))?.user;
        await interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Now Playing")
                    .addFields([
                        {
                            name: current?.title!,
                            value: `Requested by ${requester?.tag!}`,
                            inline: false
                        },
                        {
                            name: "Progress",
                            value: `\`${TimeUtils.fromMS(player.position!)} <${
                                TimeUtils.progressBar(player.accuratePosition!, current?.length!)
                                }> ${TimeUtils.fromMS(current?.length!)}\``,
                            inline: false
                        }
                    ])
            ]
        });
    }
}
