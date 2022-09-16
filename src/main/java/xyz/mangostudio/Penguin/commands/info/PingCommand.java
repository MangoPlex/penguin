package xyz.mangostudio.Penguin.commands.info;

import net.dv8tion.jda.api.interactions.InteractionHook;
import net.dv8tion.jda.api.interactions.commands.OptionType;
import net.dv8tion.jda.api.interactions.commands.SlashCommandInteraction;
import net.dv8tion.jda.api.interactions.commands.build.Commands;
import xyz.mangostudio.Penguin.structures.Command;
import xyz.mangostudio.Penguin.utils.OSUtils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class PingCommand extends Command {
    public PingCommand() {
        super(
                Commands.slash("ping", "Ping a domain or ip")
                        .addOption(OptionType.STRING, "ip", "Provide an ip or domain", true)
        );
    }

    @Override
    public void run(SlashCommandInteraction interaction) {
        InteractionHook hook = interaction.deferReply().complete();
        ProcessBuilder processBuilder = new ProcessBuilder();

        if (OSUtils.isWindows())
            processBuilder.command("cmd.exe", "/c", "ping", interaction.getOption("ip").getAsString());
        else processBuilder.command("bash", "-c", "ping", interaction.getOption("ip").getAsString());
        try {
            Process process = processBuilder.start();
            StringBuilder output = new StringBuilder();

            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }

            process.waitFor();
            hook.editOriginal("```" + output + "```").queue();
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
