import { Discord, Slash, SlashOption } from "discordx";
import { Category, Description } from "@discordx/utilities";
import { CommandInteraction, MessageEmbed, User } from "discord.js";

@Discord()
@Category("Misc Commands")
export abstract class AvatarCommand {
    @Slash("avatar")
    @Description("See user avatar")
    async roll(
        @SlashOption("user", {
            description: "The user to get the avatar",
            required: false
        }) user: User,

        interaction: CommandInteraction
    ) {
        if (!user) {
            user = interaction.user;
        }

        await interaction.reply({
            embeds: [ 
                new MessageEmbed()
                    .setTitle(`${(await interaction.client.users.fetch(user)).username}'s avatar`)
                    .setImage(user.displayAvatarURL({ size: 512, dynamic: true }))
             ]
        });
    }
}