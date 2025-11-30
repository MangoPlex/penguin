import { REST, Routes } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN!);

// for global commands
rest
  .put(Routes.applicationCommands(process.env.APPLICATION_ID!), { body: [] })
  .then(() => console.log("Successfully deleted all application commands."))
  .catch(console.error);
