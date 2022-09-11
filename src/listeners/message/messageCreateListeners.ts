import { Listener } from "@sapphire/framework";
import type { Message } from "discord.js";

export class MessageCreateListeners extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      event: "messageCreate",
    });
  }

  public async run(message: Message): Promise<void> {
    if (message.author.bot) return;
  }
}
