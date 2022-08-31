import { Discord, Slash, SlashOption } from "discordx";
import { Category, Description } from "@discordx/utilities";
import { CommandInteraction, EmbedBuilder, User } from "discord.js";

@Discord()
@Category("Misc Commands")
export abstract class AvatarCommand {
    @Slash({ name: "avatar" })
    @Description("See user avatar")
    async avatar(
        @SlashOption({
            name: "user",
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
                new EmbedBuilder()
                    .setTitle(`${(await interaction.client.users.fetch(user)).username}'s avatar`)
                    .setImage(user.displayAvatarURL({ size: 512, forceStatic: false }))
             ]
        });
    }
}
