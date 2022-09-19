package xyz.mangostudio.Penguin.db.models;

import dev.morphia.annotations.Entity;
import dev.morphia.annotations.Id;
import xyz.mangostudio.Penguin.economy.structures.Inventory;
import xyz.mangostudio.Penguin.economy.structures.Miner;

@Entity("PUsers")
public class PUser {
    @Id
    private final String uid;
    private Inventory inventory;
    private Miner miner;
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

    public void subtractBalance(int amount) {
        this.balance -= amount;
    }

    public void addBalance(int amount) {
        this.balance += amount;
    }

    public Inventory getInventory() {
        return inventory;
    }

    public void setInventory(Inventory inventory) {
        this.inventory = inventory;
    }

    public Miner getMiner() {
        return miner;
    }

    public void setMiner(Miner miner) {
        this.miner = miner;
    }
}
