package xyz.mangostudio.Penguin;

import net.dv8tion.jda.api.JDABuilder;
import net.dv8tion.jda.api.requests.GatewayIntent;
import xyz.mangostudio.Penguin.db.DbClient;

import java.util.List;

public class Main {
    private static final List<GatewayIntent> INTENTS = List.of(
            GatewayIntent.GUILD_MEMBERS,
            GatewayIntent.GUILD_VOICE_STATES,
            GatewayIntent.GUILD_MESSAGES,
            GatewayIntent.MESSAGE_CONTENT
    );

    public static void main(String[] args) {
        JDABuilder
                .create(INTENTS)
                .setToken(Config.getConfig("DISCORD_TOKEN"))
                .addEventListeners(new Listener())
                .build();
        new DbClient();
    }
}
