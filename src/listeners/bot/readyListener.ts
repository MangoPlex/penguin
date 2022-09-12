import TimeUtils from "../../util/timeUtils.js";
import MusicUtils from "../../util/musicUtils.js";
import { Listener } from "@sapphire/framework";
import type { Guild } from "discord.js";
import Settings from "../../settings.js";
import { PUser } from "../../db/models/pUser.js";
import defaultPUser from "../../db/defaults/pUser.js";
import { Economy } from "../../economy/economy.js";

export class ReadyListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      event: "ready",
    });
  }

  public async run(): Promise<void> {
    const { client } = this.container;
    this.container.logger.info(
      "Initialized and logged in as " + client.user!.tag
    );
    this.container.logger.info("Starting...");

    const guild: Guild = await this.container.client.guilds.fetch(Settings.SERVER_ID);
    guild.members.cache.forEach(async (m) => {
      if (!await PUser.findOne({ id: m.id })) {
        await new PUser(defaultPUser(m.id)).save();
      }
    });

    setInterval(() => {
      client.user!.setActivity(
        `Uptime: ${TimeUtils.fromMStoDHM(process.uptime() * 1000)}`,
        { type: "WATCHING" }
      );
    }, 6e4);

    new Economy();

    client.lavalink = new MusicUtils(client);
  }
}
