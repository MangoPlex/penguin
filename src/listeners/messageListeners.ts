import {ArgsOf, Client, Discord, On} from "discordx";

@Discord()
export default class MessageListeners {
    @On("messageCreate")
    async onMessageCreate([message]: ArgsOf<"messageCreate">, client: Client) {
        if (message.author.bot) return;
    }
}