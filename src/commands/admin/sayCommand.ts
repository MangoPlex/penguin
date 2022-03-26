import { Discord, Permission, Slash, SlashOption } from "discordx";
import { Category, Description } from "@discordx/utilities";
import { CommandInteraction, MessageEmbed } from "discord.js";

import Settings from "../../settings.js";

@Discord()
@Category("Admin Commands")
export abstract class SayCommand {
    @Slash("say")
    @Description("Say something as bot")
    @Permission({ id: Settings.ADMIN_ROLE_ID, type: "ROLE", permission: true })
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