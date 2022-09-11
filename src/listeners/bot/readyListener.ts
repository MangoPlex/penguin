import TimeUtils from "../../util/timeUtils.js";
import MusicUtils from "../../util/musicUtils.js";
import { Listener } from "@sapphire/framework";

export class ReadyListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            event: "ready"
        });
    }

    public async run(): Promise<void> {
        const { client } = this.container;
        this.container.logger.info("Initialized and logged in as " + client.user!.tag);
        this.container.logger.info("Starting...");

        setInterval(() => {
            client.user!.setActivity(
                `Uptime: ${TimeUtils.fromMStoDHM(process.uptime() * 1000)}`,
                { type: "WATCHING" }
            );
        }, 6e4);

        client.lavalink = new MusicUtils(client);
    }
}