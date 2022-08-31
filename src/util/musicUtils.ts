import { load as loadQueue, Queue } from "@lavaclient/queue";
loadQueue();
import { Client, Guild } from "discord.js";
import { Cluster, ClusterNode } from "lavaclient";

export default class MusicUtils extends Cluster {
    public constructor(client: Client) {
        super({
            nodes: [{
                id: "Node1",
                host: "server.justapie.ga",
                port: 2333,
                password: "urmomgay"
            }],
            sendGatewayPayload: async (id: string, payload) => {
                const guild: Guild = await client.guilds.fetch(id);
                if (guild) guild.shard.send(payload);
            }
        });

        this.on("nodeTrackEnd", async (node: ClusterNode, queue: Queue) => {
            await queue.next();
        });
        this.connect(client.user?.id);
    }
}