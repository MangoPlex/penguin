import type { Song } from "@lavaclient/queue";
import { ChatInputCommand, Command } from "@sapphire/framework";
import { MessageEmbed } from "discord.js";
import ArrayUtils from "../../util/arrayUtils.js";

export default class QueueCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, { ...options });
  }

  public async chatInputRun(
    interaction: Command.ChatInputInteraction
  ): Promise<void> {
    await interaction.deferReply();
    const player = interaction.client.lavalink?.getPlayer(interaction.guildId!);
    if (!player || (player.queue && player.queue.tracks.length === 0)) {
      await interaction.editReply({
        embeds: [new MessageEmbed().setDescription("Empty queue")],
      });
      return;
    }

    const div = ArrayUtils.divQueue(player.queue.tracks, 5);
    const sel = div[0];
    const embed = new MessageEmbed()
      .setTitle("Queue")
      .setDescription(`Page: 1/${div.length}`);
    sel.map(async (song: Song) => {
      const requester = await interaction.client.users.fetch(song.requester!);
      embed.addFields([
        {
          name: `${div.indexOf(song) + 1}. ${song.title}`,
          value: `Requested by: ${requester.tag}`,
          inline: false,
        },
      ]);
    });

    await interaction.editReply({
      embeds: [embed],
    });
  }

  public override registerApplicationCommands(
    registry: ChatInputCommand.Registry
  ) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName("queue")
        .setDescription("View the queue")
        .addIntegerOption((input) =>
          input
            .setName("page")
            .setDescription("The page of the queue")
            .setRequired(false)
        )
    );
  }
}
