export default class Settings {
    public static SERVER_ID = "828620095164514364";

    public static readonly ADMIN_ROLE_ID = "920654387859296286";

    public static readonly ANIME_PICS_CHANNEL_ID = "848493133608124456";

    public static VOICE_NAME = (count: number, name: string) => `#${count} | ${name}'s lounge`;
    public static VOICE_NAME_REGEX = /#[0-9] | [abc]'s lounge/;
    public static VOICE_PARENTS = [
        "956549715049201684"
    ]
}