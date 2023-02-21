package xyz.mangostudio.penguin.db.models;

import dev.morphia.annotations.Entity;
import dev.morphia.annotations.Id;
import dev.morphia.query.experimental.filters.Filters;
import dev.morphia.query.experimental.updates.UpdateOperators;
import xyz.mangostudio.penguin.db.DbClient;
import xyz.mangostudio.penguin.economy.structures.Inventory;
import xyz.mangostudio.penguin.utils.Misc;

@Entity("PUsers")
public class PUser {
    @Id
    private String uid;
    private Inventory inventory;
    private double balance;

    public PUser() {
    }

    public PUser(
            String uid,
            double balance,
            Inventory inventory
    ) {
        this.uid = uid;
        this.balance = balance;
        this.inventory = inventory;
    }

    public String getUid() {
        return this.uid;
    }

    public double getBalance() {
        return this.balance;
    }

    public void setBalance(double balance) {
        this.balance = balance;
        DbClient.getDatastore().find(PUser.class)
                .filter(Filters.eq("uid", uid))
                .update(
                        UpdateOperators.set("balance", this.balance)
                ).execute();
    }

    public void subtractBalance(double amount) {
        this.setBalance(this.balance - amount);
    }

    public void addBalance(double amount) {
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

    public static PUser getUser(String id) {
        PUser user = DbClient.getDatastore().find(PUser.class)
                .filter(Filters.eq("uid", id)).first();
        if (user == null) {
            user = DbClient.getDatastore().save(Misc.getDefaultSetting(id));
        }

        return user;
    }
}
