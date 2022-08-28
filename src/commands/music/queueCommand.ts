import { Description } from "@discordx/utilities";
import { Song } from "@lavaclient/queue";
import { ButtonInteraction, CommandInteraction, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { ButtonComponent, Discord, Slash, SlashOption } from "discordx";

@Discord()
export default class QueueCommand {
    private _page: number = 0;
    private _divdQ!: Song[][];
    private _origQ!: Song[];

    @Slash("queue")
    @Description("View queue")
    public async queue(
        @SlashOption("page", {
            required: false,
            description: "The page of the queue",
            type: "INTEGER"
        })
        page: number = 0,
        interaction: CommandInteraction
    ): Promise<void> {
        await interaction.deferReply();
        this._page = page;
        const player = interaction.client.lavalink?.getPlayer(interaction.guildId!);
        if (!player || (player.queue && player.queue.tracks.length === 0)) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription("Empty queue")
                ]
            });
            return;
        }
        this._origQ = player.queue.tracks;
        this._divdQ = this._origQ.reduce((resultArray: any[], item, index) => {
            const chunkIndex = Math.floor(index / 5);

            if (!resultArray[chunkIndex]) {
                resultArray[chunkIndex] = [];
            }
            resultArray[chunkIndex].push(item);
            return resultArray;
        }, []);
        await this.updateView(interaction, this._page);
    }

    private render(interaction: CommandInteraction, page: number): MessageEmbed | null {
        if (!this._divdQ) return null;
        if (page < 0 || page >= this._divdQ.length) {
            this._page = 0;
            return this.render(interaction, 0);
        }
        const selected: Song[] = this._divdQ[page];
        const embed = new MessageEmbed()
            .setTitle("Queue")
            .setDescription(`Page: ${page + 1}/${this._divdQ.length}`)
            .setFooter({ text: "This list might be incorrect, please use this command again to update the queue" });
        selected.map(async(song: Song) => {
            const requester = await interaction.client.users.fetch(song.requester!);
            embed.addFields(
                [
                    {
                        name: `${this._origQ.indexOf(song) + 1}. ${song.title}`,
                        value: `Requested by: ${requester.tag}`,
                        inline: false
                    }
                ]
            );
        });
        return embed;
    }

    @ButtonComponent("queue-next-page")
    private async queueNextPage(interaction: ButtonInteraction): Promise<void> {
        if (!this._divdQ) return;
        this._page++;
        if (this._page >= this._divdQ.length)
            this._page = 0;
        await this.updateView(interaction, this._page);
    }

    @ButtonComponent("queue-prev-page")
    private async queuePrevPage(interaction: ButtonInteraction): Promise<void> {
        if (!this._divdQ) return;
        this._page--;
        if (this._page < 0)
            this._page = this._divdQ.length - 1;
        await this.updateView(interaction, this._page);
    }

    @ButtonComponent("queue-close-page")
    private async queueClosePage(interaction: ButtonInteraction): Promise<void> {
        await interaction.deleteReply();
    }

    private async updateView(interaction: CommandInteraction | ButtonInteraction, page: number): Promise<void> {
        const embed = this.render(interaction, page);
        if (!embed) return;
        const row = new MessageActionRow().setComponents(
            new MessageButton()
                .setCustomId("queue-prev-page")
                .setLabel("⬅️")
                .setDisabled(this._page === 0)
                .setStyle("PRIMARY"),
            new MessageButton()
                .setCustomId("queue-next-page")
                .setLabel("➡️")
                .setDisabled(this._page === this._divdQ.length - 1)
                .setStyle("PRIMARY"),
            new MessageButton()
                .setCustomId("queue-close-page")
                .setLabel("❎")
                .setStyle("DANGER")
        );
        await interaction.editReply({
            embeds: [embed],
            components: [row]
        });
    }
}
