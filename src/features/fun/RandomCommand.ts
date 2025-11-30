import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import { randomInt } from "../../utilities/rng";

@Discord()
@SlashGroup("random")
export class RandomCommand {
  @Slash({ description: "Generate a random number" })
  async number(
    @SlashOption({
      type: ApplicationCommandOptionType.Integer,
      description: "Lower bound number (default: 1)",
      name: "min",
      required: false,
    })
    min: number = 1,
    @SlashOption({
      type: ApplicationCommandOptionType.Integer,
      description: "Upper bound number (default: 100)",
      name: "max",
      required: false,
    })
    max: number = 100,
    interaction: CommandInteraction,
  ): Promise<void> {
    if (min > max) {
      await interaction.reply({
        content: "❌ Minimum value cannot be greater than maximum value!",
        ephemeral: true,
      });

      return;
    }

    await interaction.reply({
      content: `🎲 Your random number is: **${randomInt(
        min,
        max,
      )}** (${min} - ${max})`,
    });
  }

  @Slash({ description: "Generate a random color" })
  async color(interaction: CommandInteraction): Promise<void> {
    const randomColor = Math.floor(Math.random() * 16777215);
    const hexColor = `#${randomColor.toString(16).padStart(6, "0").toUpperCase()}`;

    const embed = new EmbedBuilder()
      .setTitle("🎨 Random Color Generator")
      .setDescription(`**Color:** ${hexColor}`)
      .setColor(randomColor)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
