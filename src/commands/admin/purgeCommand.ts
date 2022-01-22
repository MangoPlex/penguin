import {ButtonComponent, Discord, Slash, SlashOption} from "discordx";
import {ButtonInteraction, CommandInteraction, MessageActionRow, MessageButton, TextChannel} from "discord.js";
import MessageUtils from "../../util/messageUtils.js";

@Discord()
export default class PurgeCommand {
    private _amount: number = 0;
    private _interaction: CommandInteraction | undefined;

    private static CANCEL_BTN = new MessageButton()
        .setLabel("Cancel")
        .setStyle("PRIMARY")
        .setCustomId("purge-cancel-btn");

    private static ACCEPT_BTN = new MessageButton()
        .setLabel("Accept")
        .setStyle("DANGER")
        .setCustomId("purge-accept-btn");

    // @Slash() - Unable to use now
    async purge(
        @SlashOption("amount", {
            description: "The maximum number to purge",
            required: true
        }) amount: number,

        interaction: CommandInteraction
    ) {
        if (amount < 1 || amount > 100) {
            return MessageUtils.replyWithErrorEmbed(interaction, "The amount must be between 1 and 100", true);
        }

        this._amount = amount;
        this._interaction = interaction;
        await interaction.deferReply();

        // await interaction.reply(`Deleted ${messages.size} messages`);
        const row = new MessageActionRow()
            .addComponents(PurgeCommand.ACCEPT_BTN)
            .addComponents(PurgeCommand.CANCEL_BTN);

        await interaction.editReply({
            content: "Are you sure you want to delete these messages?",
            components: [row],
        });
    }

    @ButtonComponent("purge-cancel-btn")
    async handleCancelButton(interaction: ButtonInteraction) {
        await interaction.deferReply();
        await interaction.deleteReply();
        await this._interaction?.deleteReply();
    }

    @ButtonComponent("purge-accept-btn")
    async handleAcceptButton(interaction: ButtonInteraction) {
        await interaction.deferReply();
        await interaction.deleteReply();

        const channel = interaction.channel as TextChannel;
        await channel.bulkDelete(await channel.messages.fetch({limit: this._amount}));
    }
}