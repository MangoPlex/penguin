package xyz.mangostudio.Penguin.economy;

import dev.morphia.Datastore;
import dev.morphia.query.experimental.filters.Filters;
import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.entities.Guild;
import xyz.mangostudio.Penguin.db.DbClient;
import xyz.mangostudio.Penguin.db.models.PUser;
import xyz.mangostudio.Penguin.economy.structures.Miner;
import xyz.mangostudio.Penguin.utils.Constants;
import xyz.mangostudio.Penguin.utils.Misc;

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

                    List<PUser> users = ds.find(PUser.class)
                            .filter(Filters.eq("uid", member.getId()))
                            .stream()
                            .toList();

                    if (users.isEmpty()) {
                        ds.save(Misc.getDefaultSetting(member.getId()));
                    }
                }
        );

        new Timer().scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                Datastore ds = DbClient.getDatastore();
                List<PUser> allUsers = ds.find(PUser.class).stream().toList();

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
