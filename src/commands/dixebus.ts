import { ActionRowBuilder, APIEmbedField, ApplicationCommandOptionType, ButtonBuilder, ButtonInteraction, ButtonStyle, Collection, CommandInteraction, EmbedBuilder, MessageActionRowComponentBuilder } from "discord.js";
import { ButtonComponent, Client, Discord, Guard, Slash, SlashOption } from "discordx";
import { BalanceGuard } from "../guards/balance.js";
import { User } from "../entities/User.js";
import { randomInt } from "../utilities/rng.js";
import { RideTheBusButtonGuard, RideTheBusGuard } from "../guards/rideTheBus.js";

export const rideTheBusStore: Collection<string, RideTheBus> = new Collection();

@Discord()
export class DiXeBusCommand {
    private static readonly EMBED_FIELDS: string[] = [
        "Round 1: Red or black?",
        "Round 2: Higher or lower?",
        "Round 3: Inside or outside?",
        "Round 4: Guess the type",
    ];
    private static readonly RANK_MAPPING: string[] = ['', '', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    private static readonly TYPE_MAPPING: string[] = ['♠️', '♣️', '♦️', '♥️'];

    @Slash({
        name: "dixebus",
        description: "Play ride a bus",
    })
    @Guard(RideTheBusGuard, BalanceGuard)
    public async dixebus(
        @SlashOption({
            type: ApplicationCommandOptionType.Integer,
            name: "amount",
            description: "Amount to bet",
            required: true,
            minValue: 1,
        })
        amount: number,
        interaction: CommandInteraction,
        _: Client,
        guardData: any
    ) {
        const user: User = guardData.fetchedUser;

        if (user.balance < amount) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("Insufficient balance"),
                ],
            });
            return;
        }

        const s = new RideTheBus(amount);
        for (let k of s.getDrawnDeck()) {
            console.log(k)
        }
        rideTheBusStore.set(interaction.user.id, s);

        await this.replyEmbed(interaction, false);
    }

    public async replyEmbed(interaction: CommandInteraction | ButtonInteraction, lost: boolean): Promise<void> {
        if (!interaction.deferred) {
            await interaction.deferReply();
        }

        if (lost) {
            rideTheBusStore.delete(interaction.user.id);
            interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("You lost")
                        .setDescription("You lost all your bets"),
                ],
            });
            return;
        }

        const session: RideTheBus = rideTheBusStore.get(interaction.user.id) as RideTheBus;

        const fields: APIEmbedField[] = [];

        for (let i: number = 0; i <= (session.getStage() < 4 ? session.getStage() : 3); i++) {
            fields.push({
                name: DiXeBusCommand.EMBED_FIELDS[i],
                value: "?"
            });
        }

        for (let j: number = 0; j < session.getStage(); j++) {
            fields[j].value = `${DiXeBusCommand.RANK_MAPPING[session.getDrawnDeck()[j].getRank()]}${DiXeBusCommand.TYPE_MAPPING[session.getDrawnDeck()[j].getType()]}`;
        }

        let title: string = "Ride the bus";

        if (session.getStage() === 4) {
            title = "You won!";
        }

        const btnRows: ButtonBuilder[][] = [
            [
                new ButtonBuilder()
                    .setLabel("Red")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("rtb-1-red"),
                new ButtonBuilder()
                    .setLabel("Black")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("rtb-1-black"),
            ],
            [
                new ButtonBuilder()
                    .setLabel("Higher")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("rtb-2-higher"),
                new ButtonBuilder()
                    .setLabel("Lower")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("rtb-2-lower"),
            ],
            [
                new ButtonBuilder()
                    .setLabel("Between")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("rtb-3-inside"),
                new ButtonBuilder()
                    .setLabel("Outside")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("rtb-3-outside"),
            ],
            [
                new ButtonBuilder()
                    .setLabel("Spade")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("rtb-4-spade"),
                new ButtonBuilder()
                    .setLabel("Club")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("rtb-4-club"),
                new ButtonBuilder()
                    .setLabel("Diamond")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("rtb-4-diamond"),
                new ButtonBuilder()
                    .setLabel("Heart")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("rtb-4-heart"),
            ]
        ];


        const componentsRow: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [];

        if (session.getStage() < 4) {
            componentsRow.push(
                new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                    btnRows[session.getStage()],
                ),
            );
        }

        componentsRow.push(
            new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                new ButtonBuilder()
                    .setLabel("Close")
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId("rtb-close"),
            )
        );


        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({
                        iconURL: interaction.user.displayAvatarURL({
                            extension: "png",
                            forceStatic: true,
                        }),
                        name: interaction.user.displayName,
                    })
                    .setTitle(title)
                    .setDescription(`Your bet: ${session.getBetAmount()}. Win this round to get ${RideTheBus.MULTIPLIER[session.getStage()]}x your money.`)
                    .addFields(fields),
            ],
            components: componentsRow,
        });
    }

    private async makeGuess(interaction: ButtonInteraction, guess: Guess): Promise<void> {
        const session: RideTheBus = rideTheBusStore.get(interaction.user.id) as RideTheBus;

        await this.replyEmbed(interaction, session.guess(guess));
    }

    private async makeColorGuess(interaction: ButtonInteraction, guess: RideTheBusCardType): Promise<void> {
        const session: RideTheBus = rideTheBusStore.get(interaction.user.id) as RideTheBus;

        await this.replyEmbed(interaction, session.guessColor(guess));
    }

    private async cashout(userId: string, amount: number): Promise<void> {
        // TODO: make cashout request later
    }

    @ButtonComponent({
        id: "rtb-1-red",
    })
    @Guard(RideTheBusButtonGuard)
    private async onRed(interaction: ButtonInteraction): Promise<void> {
        await this.makeGuess(interaction, Guess.Red);
    }

    @ButtonComponent({
        id: "rtb-1-black",
    })
    @Guard(RideTheBusButtonGuard)
    private async onBlack(interaction: ButtonInteraction): Promise<void> {
        await this.makeGuess(interaction, Guess.Black);
    }

    @ButtonComponent({
        id: "rtb-2-higher",
    })
    @Guard(RideTheBusButtonGuard)
    private async onHigher(interaction: ButtonInteraction): Promise<void> {
        await this.makeGuess(interaction, Guess.Higher);
    }

    @ButtonComponent({
        id: "rtb-2-lower",
    })
    @Guard(RideTheBusButtonGuard)
    private async onLower(interaction: ButtonInteraction): Promise<void> {
        await this.makeGuess(interaction, Guess.Lower);
    }

    @ButtonComponent({
        id: "rtb-3-inside",
    })
    @Guard(RideTheBusButtonGuard)
    private async onInside(interaction: ButtonInteraction): Promise<void> {
        await this.makeGuess(interaction, Guess.Inside);
    }

    @ButtonComponent({
        id: "rtb-3-outside",
    })
    @Guard(RideTheBusButtonGuard)
    private async onOutside(interaction: ButtonInteraction): Promise<void> {
        await this.makeGuess(interaction, Guess.Outside);
    }

    @ButtonComponent({
        id: "rtb-4-spade",
    })
    @Guard(RideTheBusButtonGuard)
    private async onSpade(interaction: ButtonInteraction): Promise<void> {
        await this.makeColorGuess(interaction, RideTheBusCardType.Spade);
    }

    @ButtonComponent({
        id: "rtb-4-club",
    })
    @Guard(RideTheBusButtonGuard)
    private async onClub(interaction: ButtonInteraction): Promise<void> {
        await this.makeColorGuess(interaction, RideTheBusCardType.Club);
    }

    @ButtonComponent({
        id: "rtb-4-diamond",
    })
    @Guard(RideTheBusButtonGuard)
    private async onDiamond(interaction: ButtonInteraction): Promise<void> {
        await this.makeColorGuess(interaction, RideTheBusCardType.Diamond);
    }

    @ButtonComponent({
        id: "rtb-4-heart",
    })
    @Guard(RideTheBusButtonGuard)
    private async onHeart(interaction: ButtonInteraction): Promise<void> {
        await this.makeColorGuess(interaction, RideTheBusCardType.Heart);
    }

    @ButtonComponent({
        id: "rtb-close",
    })
    @Guard(RideTheBusButtonGuard)
    private async onClose(interaction: ButtonInteraction): Promise<void> {
        const session: RideTheBus = rideTheBusStore.get(interaction.user.id) as RideTheBus;

        if (session.getStage() < 4) {
            let amount: number = session.getBetAmount() * (session.getStage() - 1);
            if (session.getStage() === 0) {
                amount = session.getBetAmount();
            }
            this.cashout(interaction.user.id, session.getBetAmount() * (session.getStage() - 1));
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`Cashed out! You have received ${amount}`),
                ],
            })
            return;
        }

        await interaction.deleteReply();
    }
}

export class RideTheBus {
    public static readonly MULTIPLIER: number[] = [1, 2, 3, 4, 4];
    private readonly drawnDeck: RideTheBusCard[];
    private stage: number;
    private readonly betAmount: number;
    private lost: boolean;

    public constructor(betAmount: number) {
        this.betAmount = betAmount;
        this.stage = 0;
        this.lost = false;
        this.drawnDeck = [];
        this.drawCards();
    }

    public guessColor(answer: RideTheBusCardType): boolean {
        if (this.stage !== 3) {
            throw new Error("stage must be 3 to guess the color");
        }
        const card: RideTheBusCard = this.drawnDeck[this.stage];
        ++this.stage;
        return (answer !== card.getType());
    }

    public guess(answer: Guess): boolean {
        const card: RideTheBusCard = this.drawnDeck[this.stage];
        console.log()

        switch (this.stage) {
            case 0: {
                const color: number = Number(card.getColor());
                if (
                    (!([Guess.Red, Guess.Black].includes(answer))) ||
                    ((answer ^ color) === 0)
                ) {
                    this.forfeit();
                    return true;
                }

                break;
            }

            case 1: {
                const previousCard: RideTheBusCard = this.drawnDeck[this.stage - 1];

                if (
                    (![Guess.Lower, Guess.Higher].includes(answer)) ||
                    (answer === Guess.Lower && card.compare(previousCard) > 0) ||
                    (answer === Guess.Higher && card.compare(previousCard) < 0)
                ) {
                    this.forfeit();
                    return true;
                }

                break;
            }

            case 2: {
                const previousCard: RideTheBusCard = this.drawnDeck[this.stage - 1];
                const firstCard: RideTheBusCard = this.drawnDeck[this.stage - 2];

                if (
                    (![Guess.Inside, Guess.Outside].includes(answer)) ||
                    (answer === Guess.Inside && (card.compare(firstCard) < 0 || card.compare(previousCard) > 0)) ||
                    (answer === Guess.Outside && (card.compare(firstCard) > 0 && card.compare(previousCard) < 0))
                ) {
                    this.forfeit();
                    return true;
                }

                break;
            }

            default: {
                this.forfeit();
                return true;
            }
        }

        this.stage += 1;
        return false;
    }

    public isLost(): boolean {
        return this.lost;
    }

    public getBetAmount(): number {
        return this.betAmount;
    }

    public getWinningAmount(): number {
        return this.betAmount * RideTheBus.MULTIPLIER[this.stage];
    }

    public getStage(): number {
        return this.stage;
    }

    public forfeit(): void {
        this.lost = true;
    }

    private drawCards(): void {
        for (let i: number = 0; i < 4; i++) {
            let card: RideTheBusCard = this.generateCard();

            let isTaken: boolean = false;
            for (let j: number = 0; j < this.drawnDeck.length; j++) {
                if (card.compare(this.drawnDeck[j]) === 0) {
                    isTaken = true;
                    break;
                }
            }

            if (isTaken) {
                let newCard: RideTheBusCard = card;

                while (newCard.compare(card) === 0) {
                    newCard = this.generateCard();
                }

                this.drawnDeck.push(newCard);
            } else {
                this.drawnDeck.push(card);
            }
        }
    }

    public getDrawnDeck(): RideTheBusCard[] {
        return this.drawnDeck;
    }

    private generateCard(): RideTheBusCard {
        return new RideTheBusCard(randomInt(2, 14), randomInt(0, 3));
    }
}

export class RideTheBusCard {
    /**
     * For ranks that is in letters (eg. J, Q, K, A), they are mapped as below:
     * J = 11
     * Q = 12
     * K = 13
     * A = 14
     */
    private readonly rank: number;
    private readonly type: RideTheBusCardType;

    public constructor(rank: number, type: RideTheBusCardType) {
        this.rank = rank;

        if (this.rank < 2 || this.rank > 14) {
            throw new Error("rank must be in range [2, 14]");
        }

        this.type = type;
    }

    public getRank(): number {
        return this.rank;
    }

    public getType(): RideTheBusCardType {
        return this.type;
    }

    public getColor(): boolean {
        return [RideTheBusCardType.Diamond, RideTheBusCardType.Heart].includes(this.type);
    }

    public compare(card: RideTheBusCard): number {
        const diff: number = this.rank - card.rank;

        if (diff !== 0) {
            return diff;
        }

        return this.type - card.type;
    }
}

export enum RideTheBusCardType {
    Spade,
    Club,
    Diamond,
    Heart,
}

export enum Guess {
    Red,
    Black,
    Lower,
    Higher,
    Inside,
    Outside,
}