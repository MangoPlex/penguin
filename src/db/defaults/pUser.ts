import minerData from "../../resources/economy/miners.json" assert { type: "json" };

function defaultPUser(id: string) {
    return {
        id,
        balance: 0,
        miner: {
            tier: 1,
            durability: minerData.tiers.filter((m) => m.tier === 1)[0].durability
        },
        inventory: {
            tier: 1,
            usedStorage: 0,
            maxStorage: 100,
            items: []
        }
    };
}

export default defaultPUser;