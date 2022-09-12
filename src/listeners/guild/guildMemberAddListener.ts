import { Listener } from "@sapphire/framework";
import type { GuildMember } from "discord.js";
import defaultPUser from "../../db/defaults/pUser";
import { PUser } from "../../db/models/pUser";

export class GuildMemberAddListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            event: "ready",
        });
    }

    public async run(member: GuildMember): Promise<void> {
        await new PUser(defaultPUser(member.id)).save();
    }
}