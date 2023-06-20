const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('How to use the bot, commands, etc.'),

    async execute(interaction, bot) {
        let helpText = '';

        for(let command of bot.commandManager.commandsDataArr) {
          helpText += `\n ${bot.CONSTANTS.emojis[Math.floor(Math.random() * bot.CONSTANTS.emojis.length)]} **${command.name.charAt(0).toUpperCase() + command.name.slice(1)}** commands\n`;
      
          for(let option of command.options) {
            helpText += `- \`/${option.name}\`  ${option.description}\n`;
          }
        }

        const embed = new EmbedBuilder()
            .setColor(bot.CONSTANTS.embedColor)
            .setTitle("Hii, my name is Flora")
            .setDescription(helpText)
            .setImage(bot.CONSTANTS.div);
        return await interaction.reply({ embeds: [embed] });
    }
};