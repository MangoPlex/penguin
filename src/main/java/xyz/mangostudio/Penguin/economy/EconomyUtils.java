package xyz.mangostudio.Penguin.economy;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import dev.morphia.Datastore;
import dev.morphia.query.Query;
import dev.morphia.query.experimental.filters.Filters;
import dev.morphia.query.experimental.updates.UpdateOperators;
import xyz.mangostudio.Penguin.db.DbClient;
import xyz.mangostudio.Penguin.db.models.PUser;
import xyz.mangostudio.Penguin.economy.structures.Inventory;
import xyz.mangostudio.Penguin.economy.structures.Item;
import xyz.mangostudio.Penguin.economy.structures.Miner;
import xyz.mangostudio.Penguin.utils.Misc;

import java.util.List;

public class EconomyUtils {
    private static final JsonArray invTypes;
    private static final JsonArray minerTypes;

    static {
        Gson gson = Misc.getGSON();
        invTypes = gson.fromJson(Misc.readJsonResource("inventories.json"), JsonArray.class);
        minerTypes = gson.fromJson(Misc.readJsonResource("miners.json"), JsonArray.class);
    }

    public static JsonArray getInvTypes() {
        return invTypes;
    }

    public static JsonArray getMinerTypes() {
        return minerTypes;
    }

    public static UpgradeStatus upgradeInventory(String uid, int tier) {
        Datastore ds = DbClient.getDatastore();
        Query<PUser> userQuery = ds.find(PUser.class)
                .filter(Filters.eq("uid", uid));
        List<PUser> users = userQuery.stream().toList();

        if (users.isEmpty()) return UpgradeStatus.NOT_FOUND;
        PUser user = users.get(0);

        JsonObject jsonInv = null;

        for (JsonElement e : invTypes) {
            jsonInv = e.getAsJsonObject();
            if (jsonInv.get("tier").getAsInt() == user.getInventory().getTier() + 1)
                break;
            else jsonInv = null;
        }

        if (jsonInv == null) return UpgradeStatus.MAXED_OUT;

        int price = jsonInv.get("price").getAsInt();

        if (user.getBalance() - price < 0) return UpgradeStatus.NOT_ENOUGH_MONEY;

        user.subtractBalance(price);
        List<Item> userItems = user.getInventory().getItems();
        Inventory inventory = Misc.getGSON().fromJson(jsonInv, Inventory.class);
        inventory.setItems(userItems);
        user.setInventory(inventory);

        userQuery.update(
                UpdateOperators.set("inventory", inventory)
        ).execute();

        return UpgradeStatus.SUCCESS;
    }

    public static UpgradeStatus upgradeMiner(String uid, int tier) {
        Datastore ds = DbClient.getDatastore();
        Query<PUser> userQuery = ds.find(PUser.class)
                .filter(Filters.eq("uid", uid));
        List<PUser> users = userQuery.stream().toList();

        if (users.isEmpty()) return UpgradeStatus.NOT_FOUND;
        PUser user = users.get(0);

        JsonObject jsonMiner = null;

        for (JsonElement e : minerTypes) {
            jsonMiner = e.getAsJsonObject();
            if (jsonMiner.get("tier").getAsInt() == user.getInventory().getTier() + 1)
                break;
            else jsonMiner = null;
        }

        if (jsonMiner == null) return UpgradeStatus.MAXED_OUT;

        int price = jsonMiner.get("price").getAsInt();

        if (user.getBalance() - price < 0) return UpgradeStatus.NOT_ENOUGH_MONEY;

        user.subtractBalance(price);
        Miner miner = Misc.getGSON().fromJson(jsonMiner, Miner.class);

        userQuery.update(
                UpdateOperators.set("miner", miner)
        ).execute();

        return UpgradeStatus.SUCCESS;
    }

    public enum UpgradeStatus {
        SUCCESS,
        NOT_ENOUGH_MONEY,
        MAXED_OUT,
        NOT_FOUND
    }
}
