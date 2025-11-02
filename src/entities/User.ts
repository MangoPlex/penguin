import { Column, Entity, PrimaryColumn, Repository } from "typeorm";
import { ds } from "../utilities/db.js";

@Entity()
export class User {
    @PrimaryColumn({
        type: "text",
        unique: true,
    })
    public id: string;

    @Column({
        type: "integer",
        nullable: false,
        default: 0,
    })
    public balance: number = 0;
}

export const userRepo: Repository<User> = ds.getRepository(User);