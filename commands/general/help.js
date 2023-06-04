const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('help'),

    async execute(interaction, bot) {
        let text = " ";
        for (command of bot.commandManager.commandsDataArr) {
            text = text + `\n\n **${command.name}** \n↪️ ${command.description}`
        }

        return await bot.messageHandler.replyInteraction(
            {
                title: "Hey! My name is BanHammer3000, what's up?",
                text: text
            },
            interaction
        )
    }
};