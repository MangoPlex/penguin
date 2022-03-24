import {Discord, Slash, SlashOption} from "discordx";
import {CommandInteraction} from "discord.js";

@Discord()
export abstract class RollCommand {
    @Slash("roll", { description: "Roll a random number" })
    async roll(
        @SlashOption("max", {
            description: "The maximum number to roll",
            required: false
        }) max: number = 100,

        interaction: CommandInteraction
    ) {
        if (max < 1) {
            await interaction.reply({
                content: "The maximum number must be greater than 0",
                ephemeral: true
            });
        } else await interaction.reply(`You rolled a ${Math.floor(Math.random() * max) + 1}`);
    }
}