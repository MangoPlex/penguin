import { ChatInputCommand, Command } from "@sapphire/framework";

export class TaiXiuCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, { ...options });
  }

  public async chatInputRun(
    interaction: Command.ChatInputInteraction
  ): Promise<void> {
    const rand = Math.floor(Math.random() * 13 + 4);
    await interaction.reply(rand <= 10 ? "Xỉu" : "Tài");
  }

  public override registerApplicationCommands(
    registry: ChatInputCommand.Registry
  ): void {
    registry.registerChatInputCommand((builder) =>
      builder.setName("taixiu").setDescription("Đánh tài xỉu cực uy tín")
    );
  }
}
