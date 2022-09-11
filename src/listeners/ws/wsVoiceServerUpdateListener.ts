import { Listener } from "@sapphire/framework";

export class WSVoiceServerUpdateListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      emitter: "ws",
      event: "VOICE_SERVER_UPDATE",
    });
  }

  public async run(data: any): Promise<void> {
    await this.container.client.lavalink?.handleVoiceUpdate(data);
  }
}
