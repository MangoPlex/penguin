package xyz.mangostudio.Penguin.utils;

import com.google.gson.Gson;
import okhttp3.OkHttpClient;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
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

    public static String readJsonResource(String fileName) {
        InputStream is = EconomyUtils.class.getClassLoader().getResourceAsStream(fileName);
        InputStreamReader isr = new InputStreamReader(is);
        BufferedReader reader = new BufferedReader(isr);
        return reader.lines().collect(Collectors.joining(""));
    }
}
