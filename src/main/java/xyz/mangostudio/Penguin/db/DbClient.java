package xyz.mangostudio.Penguin.db;

import com.mongodb.MongoClient;
import dev.morphia.Datastore;
import dev.morphia.Morphia;
import xyz.mangostudio.Penguin.Config;

public class DbClient extends Morphia {
    private static Datastore datastore;

    public DbClient() {
        super();
        this.mapPackage("xyz.mangostudio.Penguin");
        datastore = this.createDatastore(
                new MongoClient(
                        Config.getConfig("DATABASE_HOST"),
                        Integer.parseInt(Config.getConfig("DATABASE_PORT"))
                ),
                Config.getConfig("DATABASE_NAME")
        );
        datastore.ensureIndexes();
    }

    public static Datastore getDatastore() {
        return datastore;
    }
}
