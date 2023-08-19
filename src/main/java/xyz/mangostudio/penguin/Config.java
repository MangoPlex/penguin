package xyz.mangostudio.penguin;

import io.github.cdimascio.dotenv.Dotenv;

public class Config {
    private static final Dotenv DOTENV = Dotenv.configure().ignoreIfMissing().systemProperties().load();

    public static String getConfig(String key) {
        return DOTENV.get(key);
    }
}
