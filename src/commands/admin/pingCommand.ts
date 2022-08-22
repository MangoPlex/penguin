import { Discord, Permission, Slash, SlashOption } from "discordx";
import { Category, Description } from "@discordx/utilities";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { exec } from "child_process";

import OsUtils from "../../util/osUtils.js";

@Discord()
@Category("Admin Commands")
export abstract class PingCommand {
    @Slash("ping")
    @Description("Ping a domain or ip")
        // Removed bc bots cannot control permission anymore
        // see: https://discord.com/developers/docs/topics/permissions
    // @Permission({ id: "920654387859296286", type: "ROLE", permission: true })
    async say(
        @SlashOption("ip", {
            description: "Provide an ip or domain",
            required: false
        }) ip: string,

        interaction: CommandInteraction
    ) {
        await interaction.deferReply();

        if (ip) {
            exec(OsUtils.isLinux() ? `ping -c 4 ${ip}` : `ping -n 4 -t 128 ${ip}`, async (error, stdout, stderr) => {
                await interaction.editReply("```" + stdout + "```")
            })
        } else {
            await interaction.editReply(`🏓Latency is ${Date.now() - interaction.createdTimestamp}ms. API Latency is ${Math.round(interaction.client.ws.ping)}ms`)
        }
    }
}