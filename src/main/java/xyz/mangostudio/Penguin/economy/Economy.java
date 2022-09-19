package xyz.mangostudio.Penguin.economy;

import dev.morphia.Datastore;
import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.entities.Guild;
import xyz.mangostudio.Penguin.db.DbClient;
import xyz.mangostudio.Penguin.db.models.PUser;
import xyz.mangostudio.Penguin.economy.structures.Inventory;
import xyz.mangostudio.Penguin.economy.structures.Miner;
import xyz.mangostudio.Penguin.utils.Constants;

import java.util.ArrayList;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;

public class Economy {
    private final JDA jda;

    public Economy(JDA jda) {
        this.jda = jda;
    }

    public void handle() {
        Guild guild = this.jda.getGuildById(Constants.SERVER_ID);
        assert guild != null;

        guild.getMembers().stream().filter(
                (member) -> !member.getUser().isBot()
        ).forEach(
                (member) -> {
                    Datastore ds = DbClient.getDatastore();

                    List<PUser> users = ds.createQuery(PUser.class)
                            .field("uid")
                            .equalIgnoreCase(member.getId())
                            .find()
                            .toList();

                    if (users.isEmpty()) {
                        ds.save(new PUser(
                                member.getId(),
                                0,
                                new Inventory(
                                        1,
                                        new ArrayList<>(),
                                        10,
                                        0
                                ),
                                new Miner(
                                        1,
                                        10,
                                        50,
                                        0,
                                        10
                                )
                        ));
                    }
                }
        );

        new Timer().scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                Datastore ds = DbClient.getDatastore();
                List<PUser> allUsers = ds.createQuery(PUser.class).find().toList();

                for (PUser user : allUsers) {
                    Miner miner = user.getMiner();
                    double rand = Math.floor(Math.random() * 100);

                    if (rand <= miner.getSuccessRate()) {
                        user.addBalance(miner.getMoneyRate());
                        user.getMiner().setDurability(user.getMiner().getDurability() - 1);

                        ds.save(user);
                    }
                }
            }
        }, 0, 60 * 60 * 1000);
    }
}
