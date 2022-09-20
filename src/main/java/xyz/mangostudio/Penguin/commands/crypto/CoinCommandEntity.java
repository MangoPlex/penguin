package xyz.mangostudio.penguin.commands.crypto;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.interactions.InteractionHook;
import net.dv8tion.jda.api.interactions.commands.OptionType;
import net.dv8tion.jda.api.interactions.commands.SlashCommandInteraction;
import net.dv8tion.jda.api.interactions.commands.build.Commands;
import xyz.mangostudio.penguin.structures.Command;
import xyz.mangostudio.penguin.utils.CryptoUtils;
import xyz.mangostudio.penguin.utils.Misc;

import java.text.NumberFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class CoinCommand extends Command {
    public CoinCommand() {
        super(
                Commands.slash("coin", "Get price of the cryptocurrency")
                        .addOption(OptionType.STRING, "coin", "The coin's name", true)
        );
    }

    @Override
    public void run(SlashCommandInteraction interaction) {
        InteractionHook hook = interaction.deferReply().complete();
        List<String> coin = CryptoUtils.formatCoin(interaction.getOption("coin").getAsString());

        String coinPriceData = CryptoUtils.getCryptoPrice(String.join(",", coin), "vnd,usd");

        if (coinPriceData == null || coinPriceData.equalsIgnoreCase("{}")) {
            hook.editOriginal("Coin not found").queue();
            return;
        }

        Gson gson = Misc.getGSON();
        JsonObject jo = gson.fromJson(coinPriceData, JsonObject.class);
        EmbedBuilder embed = new EmbedBuilder()
                .setTitle("Coin price")
                .setFooter("Requested on " + new Date());

        for (Map.Entry<String, JsonElement> entry : jo.entrySet()) {
            JsonObject subJo = jo.getAsJsonObject(entry.getKey());

            String usd = NumberFormat.getInstance(new Locale("en", "US")).format(subJo.get("usd").getAsFloat());
            String vnd = NumberFormat.getInstance(new Locale("vi", "VN")).format(subJo.get("vnd").getAsFloat());

            embed.addField(
                    ((char) (entry.getKey().charAt(0) - 32)) + entry.getKey().substring(1),
                    "Price per unit: $" + usd + " (" + vnd + "₫)",
                    false
            );
        }

        hook.editOriginalEmbeds(embed.build()).queue();
    }
}
