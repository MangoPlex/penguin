import {ArgsOf, Client, Discord, On} from "discordx";

@Discord()
export default class MessageListener {
    @On("interactionCreate")
    async onInteractionCreate([interaction]: ArgsOf<"interactionCreate">, client: Client) {
        await client.executeInteraction(interaction);
    }

    @On("messageCreate")
    async onMessageCreate([message]: ArgsOf<"messageCreate">, client: Client) {
        await client.executeCommand(message);
    }
}