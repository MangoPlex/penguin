package xyz.mangostudio.Penguin.utils;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

import java.io.IOException;

public class CryptoUtils {
    private static final OkHttpClient CLIENT = new OkHttpClient();

    public static String formatCoin(String coin) {
        if (coin.equalsIgnoreCase("btc")) return "bitcoin";
        else if (coin.equalsIgnoreCase("eth")) return "ethereum";
        else if (coin.equalsIgnoreCase("mana")) return "decentraland";
        else if (coin.equalsIgnoreCase("doge")) return "dogecoin";
        else if (coin.equalsIgnoreCase("matic")) return "polygon";
        return coin;
    }

    public static String getCryptoPrice(String coin, String vsUnit) {
        Request request = new Request.Builder()
                .url("https://api.coingecko.com/api/v3/simple/price?ids=" + coin + "&vs_currencies=" + vsUnit)
                .build();
        try (Response response = CLIENT.newCall(request).execute()) {
            return response.body().string();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }
}
