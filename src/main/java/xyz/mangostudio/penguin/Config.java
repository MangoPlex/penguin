package xyz.mangostudio.penguin;

import io.github.cdimascio.dotenv.Dotenv;

public class Config {
    private static final Dotenv DOTENV = Dotenv.configure().systemProperties().load();

    public static String getConfig(String key) {
        String val = DOTENV.get(key);
        if (val == null) val = System.getenv(key);
        return val;
    }
}
