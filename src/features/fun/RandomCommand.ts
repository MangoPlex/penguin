import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import { randomInt } from "../../utilities/rng";

@Discord()
@SlashGroup({ description: "Generate random stuff", name: "random" })
export class RandomCommand {
  @SlashGroup("random")
  @Slash({ description: "Generate a random number" })
  async number(
    @SlashOption({
      type: ApplicationCommandOptionType.Integer,
      description: "Lower bound number (default: 1)",
      name: "lower",
      required: false,
    })
    lower: number = 1,
    @SlashOption({
      type: ApplicationCommandOptionType.Integer,
      description: "Upper bound number (default: 100)",
      name: "upper",
      required: false,
    })
    upper: number = 100,
    interaction: CommandInteraction,
  ): Promise<void> {
    if (lower > upper) {
      await interaction.editReply({
        content:
          "⚠️ The lower bound number must be less than or equal to the upper bound number.",
      });

      return;
    }

    await interaction.editReply({
      content: `🎲 Your random number is: **${randomInt(
        lower,
        upper,
      )}** (${lower} - ${upper})`,
    });
  }

  @SlashGroup("random")
  @Slash({ description: "Generate a random color" })
  async color(interaction: CommandInteraction): Promise<void> {
    const randomColor = Math.floor(Math.random() * 16777215);
    const hexColor = `#${randomColor.toString(16).padStart(6, "0").toUpperCase()}`;

    const embed = new EmbedBuilder()
      .setTitle("🎨 Random Color Generator")
      .setDescription(`**Color:** ${hexColor}`)
      .setColor(randomColor)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
}
