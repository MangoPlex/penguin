package xyz.mangostudio.penguin.economy;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import xyz.mangostudio.penguin.utils.Misc;

public class EconomyUtils {
    private static final JsonArray invTypes;

    static {
        Gson gson = Misc.getGSON();
        invTypes = gson.fromJson(Misc.readJsonResource("inventories.json"), JsonArray.class);
    }

    public static JsonArray getInvTypes() {
        return invTypes;
    }
}
