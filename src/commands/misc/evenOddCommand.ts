import { Description } from "@discordx/utilities";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash } from "discordx";

@Discord()
export class EvenOddCommand {
    @Slash({ name: "chanle" })
    @Description("Đánh chẵn lẻ cực uy tín")
    public async evenOdd(interaction: CommandInteraction): Promise<void> {
        const rand = Math.floor(Math.random() * 100);
        await interaction.reply(rand % 2 === 0 ? "Chẵn" : "Lẻ");
    }
}