import { ChatInputCommand, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
  name: "balance",
  description: "Check your balance",
})
export class BalanceCommand extends Command {
  public override registerApplicationCommands(
    registry: ChatInputCommand.Registry
  ): void {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
    });
  }

  public async chatInputRun(
    interaction: Command.ChatInputInteraction
  ): Promise<void> {
    await interaction.reply("This command is not ready yet");
  }
}
