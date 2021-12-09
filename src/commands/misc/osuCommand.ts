import {Discord, Slash, SlashGroup} from "discordx";

@Discord()
@SlashGroup("osu")
export default class OsuCommand {
    @Slash("user", { description: "Show osu user information" })
    async user() {

    }
}