package xyz.mangostudio.Penguin.commands.crypto;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.interactions.InteractionHook;
import net.dv8tion.jda.api.interactions.commands.OptionType;
import net.dv8tion.jda.api.interactions.commands.SlashCommandInteraction;
import net.dv8tion.jda.api.interactions.commands.build.Commands;
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

        Gson gson = new Gson();
        JsonObject jo = gson.fromJson(coinPriceData, JsonObject.class).getAsJsonObject(coin);
        int usd = jo.get("usd").getAsInt();
        int vnd = jo.get("vnd").getAsInt();

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
