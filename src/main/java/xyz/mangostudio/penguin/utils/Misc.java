package xyz.mangostudio.penguin.utils;

import com.google.gson.Gson;
import okhttp3.OkHttpClient;
import xyz.mangostudio.penguin.db.models.PUser;
import xyz.mangostudio.penguin.economy.EconomyUtils;
import xyz.mangostudio.penguin.economy.structures.Inventory;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.stream.Collectors;

public class Misc {
    private static final Gson GSON = new Gson();
    private static final OkHttpClient OK_HTTP_CLIENT = new OkHttpClient();

    public static Gson getGSON() {
        return GSON;
    }

    public static OkHttpClient getOkHttpClient() {
        return OK_HTTP_CLIENT;
    }

    public static PUser getDefaultSetting(String uid) {
        return new PUser(
                uid,
                0D,
                new Inventory(
                        uid,
                        1,
                        new ArrayList<>(),
                        10,
                        0
                )
        );
    }

    public static String readJsonResource(String fileName) {
        InputStream is = EconomyUtils.class.getClassLoader().getResourceAsStream(fileName);
        InputStreamReader isr = new InputStreamReader(is);
        BufferedReader reader = new BufferedReader(isr);
        return reader.lines().collect(Collectors.joining(""));
    }
}
