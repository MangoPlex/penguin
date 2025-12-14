import { Client } from "discordx";

export async function fetchEmojiString(client: Client, emojiName: string): Promise<string> {
    const emojiCache = client.application?.emojis.cache;

    const filtered = emojiCache?.filter((v) => {
        return v.name === emojiName;
    })

    if (!filtered?.size) {
        return "";
    }

    return `<:${emojiName}:${filtered.first()?.id}>`;
}