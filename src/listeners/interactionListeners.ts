import { MessageComponentInteraction } from "discord.js";
import type { ArgsOf } from "discordx";
import { Client, Discord, On } from "discordx";

@Discord()
export default class InteractionListeners {
    @On({
        event: "interactionCreate"
    })
    async onInteractionCreate([interaction]: ArgsOf<"interactionCreate">, client: Client) {
        if (interaction instanceof MessageComponentInteraction)
            await interaction.deferUpdate();
        await client.executeInteraction(interaction);
    }
}