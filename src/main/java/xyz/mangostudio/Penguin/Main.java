package xyz.mangostudio.Penguin;

import net.dv8tion.jda.api.JDABuilder;
import net.dv8tion.jda.api.requests.GatewayIntent;

import java.io.IOException;
import java.util.List;
import java.util.Properties;

public class Main {
    private static final Properties PROPERTIES = new Properties();
    private static final List<GatewayIntent> INTENTS = List.of(
            GatewayIntent.GUILD_MEMBERS,
            GatewayIntent.GUILD_VOICE_STATES,
            GatewayIntent.GUILD_MESSAGES,
            GatewayIntent.MESSAGE_CONTENT
    );

    static {
        try {
            PROPERTIES.load(Main.class.getClassLoader().getResourceAsStream("config.properties"));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }


    public static void main(String[] args) {
        JDABuilder
                .create(INTENTS)
                .setToken((String) PROPERTIES.get("token"))
                .addEventListeners(new Listener())
                .build();
    }
}
