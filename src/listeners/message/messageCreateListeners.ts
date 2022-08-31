import type { ArgsOf } from "discordx";
import { Client, Discord, On } from "discordx";

@Discord()
export default class MessageCreateListeners {
    @On({
        event: "messageCreate"
    })
    async onMessageCreate([message]: ArgsOf<"messageCreate">, client: Client) {
        if (message.author.bot) return;
    }
}