import { ChatInputCommand, Command } from "@sapphire/framework";
import { MessageEmbed } from "discord.js";
import TimeUtils from "../../util/timeUtils.js";

export class ControllerCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, { ...options });
  }

  public async chatInputRun(
    interaction: Command.ChatInputInteraction
  ): Promise<void> {
    const player = interaction.client.lavalink?.getPlayer(interaction.guildId!);
    if (!player || (player && !player.queue.current)) {
      await interaction.reply({
        embeds: [new MessageEmbed().setDescription("No current song")],
      });
      return;
    }
    const current = player.queue.current;
    const requester = (
      await interaction.guild?.members.fetch(current?.requester!)
    )?.user;
    await interaction.reply({
      embeds: [
        new MessageEmbed().setTitle("Now Playing").addFields([
          {
            name: current?.title!,
            value: `Requested by ${requester?.tag!}`,
            inline: false,
          },
          {
            name: "Progress",
            value: `\`${TimeUtils.fromMS(
              player.position!
            )} <${TimeUtils.progressBar(
              player.accuratePosition!,
              current?.length!
            )}> ${TimeUtils.fromMS(current?.length!)}\``,
            inline: false,
          },
        ]),
      ],
    });
  }

  public override registerApplicationCommands(
    registry: ChatInputCommand.Registry
  ) {
    registry.registerChatInputCommand((builder) =>
      builder.setName("controller").setDescription("Control the player")
    );
  }
}
