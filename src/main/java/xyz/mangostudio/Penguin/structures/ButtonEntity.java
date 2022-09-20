package xyz.mangostudio.penguin.structures;

import net.dv8tion.jda.api.interactions.InteractionHook;

import java.util.ArrayList;
import java.util.List;

public abstract class Button {
    private static final List<String> BUTTON_IDS = new ArrayList<>();

    public List<String> getButtonIds() {
        return BUTTON_IDS;
    }

    public void addButtonIds(String... ids) {
        BUTTON_IDS.addAll(List.of(ids));
    }

    public abstract void run(InteractionHook hook);
}
