import { ButtonInteraction, Client, CommandInteraction, EmbedBuilder } from "discord.js";
import { GuardFunction, Next } from "discordx";
import { rideTheBusStore } from "../commands/dixebus.js";

export const RideTheBusGuard: GuardFunction = async (
    interaction: CommandInteraction,
    _: Client,
    next: Next,
) => {
    if (rideTheBusStore.has(interaction.user.id)) {
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setDescription("You already have a ride the bus ongoing"),
            ],
        });
        return;
    }

    await next();
};


export const RideTheBusButtonGuard: GuardFunction = async (
    interaction: ButtonInteraction,
    _: Client,
    next: Next,
) => {
    if (!rideTheBusStore.has(interaction.user.id)) {
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setDescription("You do not have an ongoing ride the bus session"),
            ],
        });
        return;
    }

    await next();
};