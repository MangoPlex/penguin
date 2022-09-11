import { ChatInputCommand, Command } from "@sapphire/framework";
import { CommandInteraction } from "discord.js";

export class RollCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, { ...options });
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction): Promise<void> {
        const min = interaction.options.getInteger("min") || 1;
        const max = interaction.options.getInteger("max") || 100;

        if (min < 1 || max < min) {
            await interaction.reply({
                content: "The minimum number must be greater than 0 or the maximum number must be greater than the minimum number",
                ephemeral: true
            });
        } else {
            let roll = Math.floor(Math.random() * (max - min + 1)) + min;

            if (roll === 727) {
                await interaction.reply(`You rolled a 727, this is your rewards: <https://youtu.be/xvFZjo5PgG0>`);
            } else await interaction.reply(`You rolled a ${roll}`);
        }
    }

    public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder.setName("roll").setDescription("Roll a random number")
                .addIntegerOption((input) => input.setName("max").setDescription("The maximum number to roll"))
                .addIntegerOption((input) => input.setName("min").setDescription("The minimum number to roll"))
        );
    }
}