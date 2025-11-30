import { CommandInteraction, Events, GatewayIntentBits } from "discord.js";
import { Client } from "discordx";

export const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],

  // To use only guild command
  botGuilds: [(_) => process.env.GUILD_ID!],

  // Debug logs are disabled in silent mode
  silent: false,
});

bot.once(Events.ClientReady, () => {
  // Synchronize applications commands with Discord
  void bot.initApplicationCommands();

  console.log(`Ready! Logged in as ${bot.user?.tag}`);
});

bot.on(Events.InteractionCreate, async (interaction) => {
  if (interaction instanceof CommandInteraction) {
    await interaction.deferReply();
  }
  bot.executeInteraction(interaction);
});
