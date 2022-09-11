import { Listener } from "@sapphire/framework";

export class WSVoiceStateUpdateListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            emitter: "ws",
            event: "VOICE_STATE_UPDATE"
        });
    }

    public async run(data: any): Promise<void> {
        await this.container.client.lavalink?.handleVoiceUpdate(data);
    }
}