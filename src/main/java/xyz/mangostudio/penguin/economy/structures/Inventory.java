package xyz.mangostudio.penguin.economy.structures;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import dev.morphia.query.Query;
import dev.morphia.query.experimental.filters.Filters;
import dev.morphia.query.experimental.updates.UpdateOperators;
import xyz.mangostudio.penguin.db.DbClient;
import xyz.mangostudio.penguin.db.models.PUser;
import xyz.mangostudio.penguin.economy.EconomyUtils;
import xyz.mangostudio.penguin.economy.enums.UpgradeStatus;
import xyz.mangostudio.penguin.utils.Misc;

import java.util.List;

public class Inventory {
    private String userId;
    private int tier;
    private List<Item> items;
    private int maxCapacity;
    private int used;

    public Inventory() {
    }

    public Inventory(String userId, int tier, List<Item> items, int maxCapacity, int used) {
        this.userId = userId;
        this.tier = tier;
        this.items = items;
        this.maxCapacity = maxCapacity;
        this.used = used;
    }

    public int getTier() {
        return tier;
    }

    public List<Item> getItems() {
        return items;
    }

    public UpgradeStatus upgrade() {
        Query<PUser> userQuery = DbClient.getDatastore().find(PUser.class)
                .filter(Filters.eq("uid", this.userId));
        List<PUser> users = userQuery.stream().toList();

        if (users.isEmpty()) return UpgradeStatus.NOT_FOUND;
        PUser user = users.get(0);

        JsonObject jsonInv = null;

        for (JsonElement e : EconomyUtils.getInvTypes()) {
            jsonInv = e.getAsJsonObject();
            if (jsonInv.get("tier").getAsInt() == user.getInventory().getTier() + 1)
                break;
            else jsonInv = null;
        }

        if (jsonInv == null) return UpgradeStatus.MAXED_OUT;

        int price = jsonInv.get("price").getAsInt();

        if (user.getBalance() - price < 0) return UpgradeStatus.NOT_ENOUGH_MONEY;

        user.setBalance(price);
        List<Item> userItems = user.getInventory().getItems();
        Inventory inventory = Misc.getGSON().fromJson(jsonInv, Inventory.class);
        this.items = userItems;
        user.setInventory(inventory);

        return UpgradeStatus.SUCCESS;
    }

    public int getMaxCapacity() {
        return maxCapacity;
    }

    public int getUsed() {
        return used;
    }
}
