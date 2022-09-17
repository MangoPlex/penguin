package xyz.mangostudio.Penguin.db.models;

import dev.morphia.annotations.Entity;
import dev.morphia.annotations.Id;
import xyz.mangostudio.Penguin.economy.structures.Inventory;
import xyz.mangostudio.Penguin.economy.structures.Miner;

@Entity("PUser")
public class PUser {
    @Id
    private final String uid;
    private final Inventory inventory;
    private final Miner miner;
    private int balance;

    public PUser(
            String uid,
            int balance,
            Inventory inventory, Miner miner) {
        this.uid = uid;
        this.balance = balance;
        this.inventory = inventory;
        this.miner = miner;
    }

    public String getUid() {
        return this.uid;
    }

    public int getBalance() {
        return this.balance;
    }

    public void setBalance(int balance) {
        this.balance = balance;
    }

    public Inventory getInventory() {
        return inventory;
    }

    public void upgradeInventory(int tier) {

    }

    public Miner getMiner() {
        return miner;
    }

    public void upgradeMiner(int tier) {

    }
}
