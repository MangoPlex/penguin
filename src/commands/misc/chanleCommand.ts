import { ChatInputCommand, Command } from "@sapphire/framework";

export class EvenOddCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, { ...options });
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction): Promise<void> {
        const rand = Math.floor(Math.random() * 100);
        await interaction.reply(rand % 2 === 0 ? "Chẵn" : "Lẻ");
    }

    public override registerApplicationCommands(registry: ChatInputCommand.Registry): void {
        registry.registerChatInputCommand((builder) =>
            builder.setName("chanle").setDescription("Đánh chẵn lẻ cực uy tín")
        );
    }
}