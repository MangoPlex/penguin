import type { Item } from "./item.js";

export interface Inventory {
    tier?: number,
    maxStorage?: number,
    usedStorage?: number,
    items?: Item[]
}