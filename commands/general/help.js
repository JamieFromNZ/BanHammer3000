const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('How to use the bot, commands, etc.'),

    async execute(interaction, bot) {
        let text = " ";
        for (command of bot.commandManager.commandsDataArr) {
            text = text + `\n\n **${command.name}** \n↪️ ${command.description}`
        }

        return await bot.messageHandler.replyInteraction(
            {
                title: "Hey! My name is FloraBlitz, what's up?",
                text: text
            },
            interaction
        )
    }
};