package xyz.mangostudio.Penguin.economy.structures;

import java.util.List;

public class Inventory {
    private final int tier;
    private final List<Item> items;
    private final int maxCapacity;
    private final int used;

    public Inventory(int tier, List<Item> items, int maxCapacity, int used) {
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

    public int getMaxCapacity() {
        return maxCapacity;
    }

    public int getUsed() {
        return used;
    }
}
