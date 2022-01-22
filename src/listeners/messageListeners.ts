import {ArgsOf, Client, Discord, On} from "discordx";

@Discord()
export default class MessageListeners {
    @On("messageCreate")
    async onMessageCreate([message]: ArgsOf<"messageCreate">, client: Client) {
        if (message.author.bot) return;

        if (message.channelId  === "892972597933912124") {
            if (message.attachments.size == 0) {
                await message.channel.send("Dung co chat o day may thang ngu").then((msg) => setTimeout(() => msg.delete(), 5000));
                await message.delete();
                return;
            }
        }
    }
}