package xyz.mangostudio.Penguin.commands.crypto;

import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.interactions.InteractionHook;
import net.dv8tion.jda.api.interactions.commands.OptionType;
import net.dv8tion.jda.api.interactions.commands.SlashCommandInteraction;
import net.dv8tion.jda.api.interactions.commands.build.Commands;
import org.json.JSONObject;
import xyz.mangostudio.Penguin.structures.Command;
import xyz.mangostudio.Penguin.utils.CryptoUtils;

import java.text.NumberFormat;
import java.util.Locale;

public class CoinCommand extends Command {
    public CoinCommand() {
        this.applicationCommandData = Commands.slash("coin", "Get price of the cryptocurrency")
                .addOption(OptionType.STRING, "coin", "The coin's name", true);
    }

    @Override
    public void run(SlashCommandInteraction interaction) {
        InteractionHook hook = interaction.deferReply().complete();
        String coin = CryptoUtils.formatCoin(interaction.getOption("coin").getAsString());

        String coinPriceData = CryptoUtils.getCryptoPrice(coin, "vnd,usd");

        if (coinPriceData == null || coinPriceData.equalsIgnoreCase("{}")) {
            hook.editOriginal("Coin not found").queue();
            return;
        }

        JSONObject jo = new JSONObject(coinPriceData).getJSONObject(coin);
        int usd = jo.getInt("usd");
        int vnd = jo.getInt("vnd");

        String str = "1 " + coin + " = $" +
                NumberFormat.getInstance(new Locale("en", "US")).format(usd) +
                " (" +
                NumberFormat.getInstance(new Locale("vi", "VN")).format(vnd) +
                " VND)";

        hook.editOriginalEmbeds(
                new EmbedBuilder()
                        .setDescription(str)
                        .build()
        ).queue();
    }
}
