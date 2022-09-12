import mongoose, { Schema } from "mongoose";
import type { Inventory } from "../../economy/abstracts/inventory.js";

const schema: Schema = new mongoose.Schema({
    id: String,
    balance: Number,
    miner: {
        tier: Number,
        durability: Number
    },
    inventory: Array<Inventory>
});

export const PUser = mongoose.model("pUser", schema);