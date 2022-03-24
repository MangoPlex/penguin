import {ArgsOf, Client, Discord, On} from "discordx";

@Discord()
export default class VoiceStateUpdateListener {
    @On("voiceStateUpdate")
    async onVoiceStateUpdate([oldState, newState]: ArgsOf<"voiceStateUpdate">, client: Client) {
        
    }
}