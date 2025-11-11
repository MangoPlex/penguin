import { Interaction } from "discord.js";
import { Client, GuardFunction, Next } from "discordx";
import { User, userRepo } from "../entities/User.js";

export const BalanceGuard: GuardFunction = async (
    interaction: Interaction,
    _: Client,
    next: Next,
    guardData: any
) => {
    // fuck lru-cache
    let user: User | null = await userRepo.findOneBy({ id: interaction.user.id, });

    if (!user) {
        user = userRepo.create({ id: interaction.user.id, });
        user = await userRepo.save(user);
    }

    guardData.fetchedUser = user;

    await next();
};
