package xyz.mangostudio.penguin.db;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClients;
import dev.morphia.Datastore;
import dev.morphia.Morphia;
import org.bson.codecs.configuration.CodecRegistries;
import org.bson.codecs.configuration.CodecRegistry;
import org.bson.codecs.pojo.PojoCodecProvider;
import xyz.mangostudio.penguin.Config;


public class DbClient {
    private static Datastore datastore;
    private static final CodecRegistry REGISTRY = CodecRegistries.fromRegistries(
            MongoClientSettings.getDefaultCodecRegistry(),
            CodecRegistries.fromProviders(
                    PojoCodecProvider.builder().automatic(true).build()
            )
    );
    private static final MongoClientSettings SETTINGS = MongoClientSettings.builder()
            .applyConnectionString(
                    new ConnectionString(Config.getConfig("DATABASE_URL"))
            )
            .codecRegistry(REGISTRY)
            .build();

    public DbClient() {
        datastore = Morphia.createDatastore(
                MongoClients.create(
                        SETTINGS
                ),
                Config.getConfig("DATABASE_NAME")
        );
        datastore.getMapper().mapPackage("xyz.mangostudio.penguin.db.models");
        datastore.ensureIndexes();
    }

    public static Datastore getDatastore() {
        return datastore;
    }
}
