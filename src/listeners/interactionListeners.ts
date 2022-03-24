import type { ArgsOf } from "discordx";
import {Client, Discord, On} from "discordx";

@Discord()
export default class InteractionListeners {
    @On("interactionCreate")
    async onInteractionCreate([interaction]: ArgsOf<"interactionCreate">, client: Client) {
        await client.executeInteraction(interaction);
    }
}