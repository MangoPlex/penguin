import { Discord, Slash, SlashOption } from "discordx";
import { Category, Description } from "@discordx/utilities";
import { CommandInteraction } from "discord.js";

@Discord()
@Category("Misc Commands")
export abstract class RollCommand {
    @Slash({ name: "roll" })
    @Description("Roll a random number")
    async roll(
        @SlashOption({
            name: "max",
            description: "The maximum number to roll",
            required: false
        }) max: number = 100,
        @SlashOption({
            name: "min",
            description: "The minimum number to roll",
            required: false
        }) min: number = 1,

        interaction: CommandInteraction
    ) {
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
}