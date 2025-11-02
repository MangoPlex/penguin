import { DataSource } from "typeorm";

export const ds: DataSource = new DataSource({
    type: "postgres",
    parseInt8: true,
});