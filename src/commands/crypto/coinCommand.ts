import { Discord, Slash, SlashOption } from "discordx";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import { Category, Description } from "@discordx/utilities";

import CryptoHelper from "../../common/cryptoHelper.js";

@Discord()
@Category("Crypto Commands")
export abstract class CoinCommand {
    @Slash({ name: "coin" })
    @Description("Get price of the cryptocurrency")
    async coin(
        @SlashOption({
            name: "coin",
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
        else if (coin === "matic") coin = "polygon";

        await interaction.deferReply();

        try {
            const coinData = await CryptoHelper.getCryptoPrice(coin);

            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Random")
                        .setDescription(`1 ${coin} = ${coinData.usd} (${coinData.vnd})`)
                ]
            });
        } catch (e) {
            return interaction.editReply({ content: "Coin not found" });
        }
    }
}