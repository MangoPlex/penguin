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
  // botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],

  // Debug logs are disabled in silent mode
  silent: false,
});

bot.once(Events.ClientReady, () => {
  // Make sure all guilds are cached
  // await bot.guilds.fetch();

  // Synchronize applications commands with Discord
  void bot.initApplicationCommands();

  // To clear all guild commands, uncomment this line,
  // This is useful when moving from guild commands to global commands
  // It must only be executed once
  //
  //  await bot.clearApplicationCommands(
  //    ...bot.guilds.cache.map((g) => g.id)
  //  );

  console.log(`Ready! Logged in as ${bot.user?.tag}`);
});

bot.on(Events.InteractionCreate, async (interaction) => {
  if (interaction instanceof CommandInteraction) {
    await interaction.deferReply();
  }
  bot.executeInteraction(interaction);
});
