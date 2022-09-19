package xyz.mangostudio.Penguin.economy.structures;

public class Miner {
    private int tier;
    private int moneyRate;
    private int price;
    private float successRate;
    private int durability;

    public Miner() {
    }

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
