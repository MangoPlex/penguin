import { ChatInputCommand, Command } from "@sapphire/framework";
import { MessageEmbed } from "discord.js";

import CryptoHelper from "../../common/cryptoHelper.js";
import {ApplyOptions} from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
  name: "coin",
  description: 'Get price of the cryptocurrency',
})
export class CoinCommand extends Command {
  private static usdFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  private static vndFormatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  public override registerApplicationCommands(
      registry: ChatInputCommand.Registry
  ) {
    registry.registerChatInputCommand((builder) =>
        builder
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((input) =>
                input.setName("coins").setDescription("The coin's name").setRequired(true)
            )
    );
  }

  public async chatInputRun(
    interaction: Command.ChatInputInteraction
  ): Promise<void> {
    let coin = interaction.options.getString("coins")?.toLowerCase()
        .replace("btc", "bitcoin")
        .replace("eth", "ethereum")
        .replace("doge", "dogecoin")
        .replace("mana", "decentraland")
        .replace("ltc", "litecoin")
        .replace("bnb", "binancecoin")
        .replace("matic", "polygon")!;

    await interaction.deferReply();

    try {
      const allData = await CryptoHelper.getCryptoPrice(coin);
      const embed = new MessageEmbed().setColor("YELLOW");

      for (let data of allData) {
        embed.addFields(
            { name: `${data.coin.toUpperCase()}`, value: `${CoinCommand.usdFormatter.format(data.currency.usd)} (${CoinCommand.vndFormatter.format(data.currency.vnd)})`, inline: false },
        );
      }

      await interaction.editReply({
        embeds: [embed],
      });
    } catch (e) {
      await interaction.editReply({ content: "Coin not found" });
    }
  }
}
