package xyz.mangostudio.Penguin.utils;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class CryptoUtils {
    private static final OkHttpClient CLIENT = Misc.getOkHttpClient();
    private static final List<CoinData> COIN_DATA_LIST = new ArrayList<>();

    static {
        Request request = new Request.Builder()
                .url("https://api.coingecko.com/api/v3/coins/list")
                .build();
        Gson gson = Misc.getGSON();
        try (Response response = CLIENT.newCall(request).execute()) {
            JsonArray array = gson.fromJson(response.body().string(), JsonArray.class);
            array.forEach((e) -> COIN_DATA_LIST.add(gson.fromJson(e, CoinData.class)));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static List<String> formatCoin(String coin) {
        List<String> selectedCoins = Arrays.stream(coin.replaceAll("\\s+", "").split(",")).toList();

        return selectedCoins.stream().map(
                (c) ->
                        COIN_DATA_LIST.stream().filter(
                                (f) -> f.getSymbol().equalsIgnoreCase(c)
                        ).toList().get(0).getId()

        ).toList();
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

    public static class CoinData {
        private String id;
        private String name;
        private String symbol;

        public String getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public String getSymbol() {
            return symbol;
        }
    }

}
