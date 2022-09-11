import { ChatInputCommand, Command } from "@sapphire/framework";
import { MessageEmbed } from "discord.js";


export class AvatarCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options
        });
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction): Promise<void> {
        let user = interaction.options.getUser("user");

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

    public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder.setName("avatar").setDescription("See user avatar")
                .addUserOption((input) => input.setName("user").setDescription("The user to get the avatar").setRequired(false))
        );
    }
}
