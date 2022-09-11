import { ChatInputCommand, Command } from "@sapphire/framework";
import { MessageEmbed } from "discord.js";

import CryptoHelper from "../../common/cryptoHelper.js";

export class CoinCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, { ...options });
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction): Promise<void> {
        let coin = interaction.options.getString("coin")?.toLowerCase()!;

        if (coin === "btc") coin = "bitcoin";
        else if (coin === "eth") coin = "ethereum";
        else if (coin === "mana") coin = "decentraland";
        else if (coin === "doge") coin = "dogecoin";
        else if (coin === "matic") coin = "polygon";

        await interaction.deferReply();

        try {
            const coinData = await CryptoHelper.getCryptoPrice(coin);

            interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor("RANDOM")
                        .setDescription(`1 ${coin} = ${coinData.usd} (${coinData.vnd})`)
                ]
            });
            return;
        } catch (e) {
            interaction.editReply({ content: "Coin not found" });
            return;
        }
    }

    public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder.setName("coin").setDescription("Get price of the cryptocurrency")
                .addStringOption((input) => input.setName("coin").setDescription("The coin's name"))
        );
    }
}