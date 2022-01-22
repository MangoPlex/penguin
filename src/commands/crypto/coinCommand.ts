import {Discord, Slash, SlashOption} from "discordx";
import {CommandInteraction, MessageEmbed} from "discord.js";
import { Category } from "@discordx/utilities";

import CryptoHelper from "../../common/cryptoHelper.js";

@Discord()
@Category("Crypto Commands")
export abstract class CoinCommand {
    @Slash("coin", { description: "Get price of the cryptocurrency" })
    async coin(
        @SlashOption("coin", {
            description: "The coin's name",
            required: true
        }) coin: string,

        interaction: CommandInteraction
    ) {
        coin = coin.toLowerCase();

        if (coin === "btc") coin = "bitcoin";
        else if (coin === "eth") coin = "ethereum";
        else if (coin === "mana") coin = "decentraland";
        else if (coin === "doge") coin = "dogecoin";

        await interaction.deferReply();

        try {
            const coinData = await CryptoHelper.getCryptoPrice(coin);

            return interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor('RANDOM')
                        .setDescription(`1 ${coin} = ${coinData.usd} (${coinData.vnd})`)
                ]
            });
        } catch (e) {
            return interaction.editReply({ content: "Coin not found" });
        }
    }
}