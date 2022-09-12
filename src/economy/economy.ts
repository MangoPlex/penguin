import type { Miner } from "./abstracts/miner.js";
import minerData from "../resources/economy/miners.json" assert { type: "json" };
import { PUser } from "../db/models/pUser.js";

export class Economy {
    public constructor() {
        setInterval(async () => {
            let allPUsers = await PUser.find();
            allPUsers.forEach(async (doc) => {
                const userMiner: Miner = minerData.tiers.filter((c) => c.tier === doc.minerTier)[0];
                if (Math.floor(Math.random() * 100) <= userMiner.successRate! && doc.miner.durability > 0) {
                    await PUser.findOneAndUpdate({
                        id: doc.id
                    }, {
                        $set: {
                            "balance": doc.balance + userMiner.moneyRate,
                            "miner.durability": doc.miner.durability - 1
                        }
                    });
                }
            });
        }, 60 * 60 * 1000);
    }

    public static getAllMinerTiers(): Miner[] {
        return minerData.tiers;
    }
}