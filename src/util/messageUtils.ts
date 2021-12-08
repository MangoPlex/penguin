import {CommandInteraction, MessageEmbed} from "discord.js";

export default class MessageUtils {
    static async replyWithEmbed(interaction: CommandInteraction, embeds: MessageEmbed[], ephemeral: boolean): Promise<void> {
        return interaction.reply({ embeds: embeds, ephemeral: ephemeral});
    }

    static async replyWithErrorEmbed(interaction: CommandInteraction, error: string, ephemeral: boolean): Promise<void> {
        return this.replyWithEmbed(interaction, [ await this.generateErrorEmbed(error) ], ephemeral);
    }

    static async generateErrorEmbed(error: string): Promise<MessageEmbed> {
        return new MessageEmbed()
            .setColor(0xFF0000)
            .setTitle("Error")
            .setDescription(error);
    }
}