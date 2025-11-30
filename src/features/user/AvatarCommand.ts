import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
  HexColorString,
  User,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";

@Discord()
export class AvatarCommand {
  @Slash({ description: "Display user avatar", name: "avatar" })
  async avatar(
    @SlashOption({
      description: "User to show avatar for",
      name: "user",
      type: ApplicationCommandOptionType.User,
      required: false,
    })
    user: User | undefined,
    interaction: CommandInteraction,
  ): Promise<void> {
    const targetUser = user || interaction.user;

    const embed = new EmbedBuilder()
      .setTitle(`${targetUser.displayName || targetUser.username}'s Avatar`)
      .setImage(targetUser.displayAvatarURL({ size: 512 }))
      .setColor("#0099ff");

    await interaction.editReply({ embeds: [embed] });
  }
}
