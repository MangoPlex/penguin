import { Description } from "@discordx/utilities";
import { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";

@Discord()
export class TaiXiuCommand {
    @Slash({ name: "taixiu" })
    @Description("Đánh tài xỉu cực uy tín")
    public async taixiu(interaction: CommandInteraction): Promise<void> {
        const rand = Math.floor(Math.random() * 13 + 4);
        await interaction.reply(rand <= 10 ? "Xỉu" : "Tài");
    }
}