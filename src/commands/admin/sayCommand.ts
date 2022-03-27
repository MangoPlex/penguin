import { Discord, Permission, Slash, SlashOption } from "discordx";
import { Category, Description } from "@discordx/utilities";
import { CommandInteraction, MessageEmbed } from "discord.js";

@Discord()
@Category("Admin Commands")
export abstract class SayCommand {
    @Slash("say")
    @Description("Say something as bot")
    @Permission({ id: "490107873834303488", type: "USER", permission: true })
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