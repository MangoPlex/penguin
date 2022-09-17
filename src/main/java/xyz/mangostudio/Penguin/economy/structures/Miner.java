package xyz.mangostudio.Penguin.economy.structures;

public class Miner {
    private final int tier;
    private final int moneyRate;
    private final int price;
    private final float successRate;
    private int durability;

    public Miner(int tier, int moneyRate, int durability, int price, float successRate) {
        this.tier = tier;
        this.moneyRate = moneyRate;
        this.durability = durability;
        this.price = price;
        this.successRate = successRate;
    }

    public int getTier() {
        return tier;
    }

    public int getDurability() {
        return durability;
    }

    public void setDurability(int durability) {
        this.durability = durability;
    }

    public int getMoneyRate() {
        return moneyRate;
    }

    public int getPrice() {
        return price;
    }

    public float getSuccessRate() {
        return successRate;
    }
}
