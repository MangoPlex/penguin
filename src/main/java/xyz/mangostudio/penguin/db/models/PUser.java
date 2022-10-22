package xyz.mangostudio.penguin.db.models;

import dev.morphia.annotations.Entity;
import dev.morphia.annotations.Id;
import dev.morphia.query.experimental.filters.Filters;
import dev.morphia.query.experimental.updates.UpdateOperators;
import xyz.mangostudio.penguin.db.DbClient;
import xyz.mangostudio.penguin.economy.structures.Inventory;

@Entity("PUsers")
public class PUser {
    @Id
    private String uid;
    private Inventory inventory;
    private int balance;

    public PUser() {
    }

    public PUser(
            String uid,
            int balance,
            Inventory inventory
    ) {
        this.uid = uid;
        this.balance = balance;
        this.inventory = inventory;
    }

    public String getUid() {
        return this.uid;
    }

    public int getBalance() {
        return this.balance;
    }

    public void setBalance(int balance) {
        this.balance = balance;
        DbClient.getDatastore().find(PUser.class)
                .filter(Filters.eq("uid", uid))
                .update(
                        UpdateOperators.set("balance", this.balance)
                ).execute();
    }

    public void subtractBalance(int amount) {
        this.setBalance(this.balance - amount);
    }

    public void addBalance(int amount) {
        this.setBalance(this.balance + amount);
    }

    public Inventory getInventory() {
        return inventory;
    }

    public void setInventory(Inventory inventory) {
        this.inventory = inventory;
        DbClient.getDatastore().find(PUser.class)
                .filter(Filters.eq("uid", uid))
                .update(
                        UpdateOperators.set("inventory", this.balance)
                ).execute();
    }
}
