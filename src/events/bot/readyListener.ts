import {Client, Discord, Once} from "discordx";
import {TextChannel} from "discord.js";

@Discord()
export default class BotListener {
    @Once("ready")
    async onReady({}, client: Client) {
        console.log("Initialized and logged in as " + client.user!.tag);
        console.log("Starting...");

        setInterval(() => {
            (client.guilds.cache.get("private server id")?.channels.cache.get("private channel id") as TextChannel).send("Facebook post in here");
        }, 1000 * 60 * 60)
    }
}