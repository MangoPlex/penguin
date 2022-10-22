package xyz.mangostudio.penguin.economy;

import dev.morphia.Datastore;
import dev.morphia.query.experimental.filters.Filters;
import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.entities.Guild;
import xyz.mangostudio.penguin.db.DbClient;
import xyz.mangostudio.penguin.db.models.PUser;
import xyz.mangostudio.penguin.utils.Constants;
import xyz.mangostudio.penguin.utils.Misc;

import java.util.List;

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
    }
}
