import type { Song } from "@lavaclient/queue";
import {
  InteractionHandler,
  InteractionHandlerTypes,
  PieceContext,
} from "@sapphire/framework";
import {
  ButtonInteraction,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import ArrayUtils from "../util/arrayUtils.js";

export class QueueButton extends InteractionHandler {
  private _page: number = 0;
  private _divdQ!: Song[][];
  private _origQ!: Song[];

  public constructor(ctx: PieceContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public override parse(_: ButtonInteraction) {
    return this.some();
  }

  public async run(interaction: ButtonInteraction): Promise<void> {
    await interaction.deferUpdate();
    const player = interaction.client.lavalink?.getPlayer(interaction.guildId!);
    this._origQ = player?.queue.tracks!;
    this._divdQ = ArrayUtils.divQueue(this._origQ, 5);
    if (interaction.customId === "queue-next-page")
      await this.queueNextPage(interaction);
    if (interaction.customId === "queue-prev-page")
      await this.queuePrevPage(interaction);
    if (interaction.customId === "queue-close-page")
      await this.queueClosePage(interaction);
  }

  private async queueNextPage(interaction: ButtonInteraction): Promise<void> {
    if (!this._divdQ) return;
    this._page++;
    if (this._page >= this._divdQ.length) this._page = 0;
    await this.updateView(interaction, this._page);
  }

  private async queuePrevPage(interaction: ButtonInteraction): Promise<void> {
    if (!this._divdQ) return;
    this._page--;
    if (this._page < 0) this._page = this._divdQ.length - 1;
    await this.updateView(interaction, this._page);
  }

  private async queueClosePage(interaction: ButtonInteraction): Promise<void> {
    await interaction.deleteReply();
  }

  private async updateView(
    interaction: ButtonInteraction,
    page: number
  ): Promise<void> {
    const embed = this.render(interaction, page);
    if (!embed) return;
    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("queue-prev-page")
        .setLabel("⬅️")
        .setDisabled(this._page === 0)
        .setStyle(MessageButtonStyles.PRIMARY),
      new MessageButton()
        .setCustomId("queue-next-page")
        .setLabel("➡️")
        .setDisabled(this._page === this._divdQ.length - 1)
        .setStyle(MessageButtonStyles.PRIMARY),
      new MessageButton()
        .setCustomId("queue-close-page")
        .setLabel("❌")
        .setStyle(MessageButtonStyles.PRIMARY)
    );
    await interaction.editReply({
      embeds: [embed],
      components: [row],
    });
  }

  private render(
    interaction: ButtonInteraction,
    page: number
  ): MessageEmbed | null {
    if (!this._divdQ) return null;
    if (page < 0 || page >= this._divdQ.length) {
      this._page = 0;
      return this.render(interaction, 0);
    }
    const selected: Song[] = this._divdQ[page];
    const embed = new MessageEmbed()
      .setTitle("Queue")
      .setDescription(`Page: ${page + 1}/${this._divdQ.length}`);
    selected.map(async (song: Song) => {
      const requester = await interaction.client.users.fetch(song.requester!);
      embed.addFields([
        {
          name: `${this._origQ.indexOf(song) + 1}. ${song.title}`,
          value: `Requested by: ${requester.tag}`,
          inline: false,
        },
      ]);
    });
    return embed;
  }
}
