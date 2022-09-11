import { exec } from "child_process";
import OsUtils from "../../util/osUtils.js";
import { ChatInputCommand, Command } from "@sapphire/framework";

export class PingCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
    });
  }

  public async chatInputRun(
    interaction: Command.ChatInputInteraction
  ): Promise<void> {
    await interaction.deferReply();
    const ip = interaction.options.getString("ip");

    if (ip) {
      exec(
        OsUtils.isLinux() ? `ping -c 4 ${ip}` : `ping -n 4 -t 128 ${ip}`,
        async (stdout) => {
          await interaction.editReply("```" + stdout + "```");
        }
      );
    } else {
      await interaction.editReply(
        `🏓Latency is ${
          Date.now() - interaction.createdTimestamp
        }ms. API Latency is ${Math.round(interaction.client.ws.ping)}ms`
      );
    }
  }

  public override registerApplicationCommands(
    registry: ChatInputCommand.Registry
  ): void {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName("ping")
        .setDescription("Ping a domain or ip")
        .addStringOption((input) =>
          input.setName("ip").setDescription("Provide an ip or domain")
        )
    );
  }
}
