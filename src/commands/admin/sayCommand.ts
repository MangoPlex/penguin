import {Discord, Slash, SlashOption} from "discordx";
import {CommandInteraction, MessageEmbed} from "discord.js";

@Discord()
export abstract class SayCommand {
    @Slash("say", { description: "Say" })
    async say(
        @SlashOption("text", {
            description: "text",
            required: true
        }) text: string,

        interaction: CommandInteraction
    ) {
        interaction.deferReply();
        interaction.deleteReply();

        interaction.channel?.send({
            embeds: [ new MessageEmbed().setDescription(text) ]
        });
    }
}