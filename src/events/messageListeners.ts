import {ArgsOf, Client, Discord, On} from "discordx";
import PenguinConstants from "../penguinConstants.js";

@Discord()
export default class MessageListeners {
    @On("messageCreate")
    async onMessageCreate([message]: ArgsOf<"messageCreate">, client: Client) {
        if (message.channelId == PenguinConstants.MEME_DIY_CHANNEL_ID) {
            if (message.attachments.size == 0) {
                await message.delete();
                return;
            }
        }
    }
}