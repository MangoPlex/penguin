package xyz.mangostudio.penguin.structures;

import net.dv8tion.jda.api.interactions.InteractionHook;
import net.dv8tion.jda.api.interactions.commands.SlashCommandInteraction;
import net.dv8tion.jda.api.interactions.commands.build.CommandData;

import java.util.ArrayList;
import java.util.List;

public final class Entities {
    public static abstract class Button {
        private static final List<String> BUTTON_IDS = new ArrayList<>();

        public List<String> getButtonIds() {
            return BUTTON_IDS;
        }

        public void addButtonIds(String... ids) {
            BUTTON_IDS.addAll(List.of(ids));
        }

        public abstract void run(InteractionHook hook);
    }

    public static abstract class Command {
        public List<Precondition> preconditions = List.of();
        private CommandData applicationCommandData = null;

        public Command(CommandData applicationCommandData) {
            this.applicationCommandData = applicationCommandData;
        }

        public CommandData getApplicationCommandData() {
            return applicationCommandData;
        }

        public abstract void run(SlashCommandInteraction interaction);
    }

    public static abstract class Precondition {
        public abstract boolean run(SlashCommandInteraction interaction);
    }
}
