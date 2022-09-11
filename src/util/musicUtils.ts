import { load as loadQueue } from "@lavaclient/queue";
import type { Client, Guild } from "discord.js";
import { Cluster } from "lavaclient";

loadQueue();

export default class MusicUtils extends Cluster {
  public constructor(client: Client) {
    super({
      nodes: [
        {
          id: "Node1",
          host: "server.justapie.ga",
          port: 2333,
          password: "urmomgay",
        },
      ],
      sendGatewayPayload: async (id: string, payload) => {
        const guild: Guild = await client.guilds.fetch(id);
        if (guild) guild.shard.send(payload);
      },
    });

    this.connect(client.user?.id);
  }
}
