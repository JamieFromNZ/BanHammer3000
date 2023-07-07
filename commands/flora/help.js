const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('How to use the bot, commands, etc.'),

  async execute(interaction, bot) {
    let helpText = '';

    for (let command of (await bot).commandManager.commandsDataArr) {
      helpText += `\n ${bot.CONSTANTS.emojis[Math.floor(Math.random() * bot.CONSTANTS.emojis.length)]} **${command.name.charAt(0).toUpperCase() + command.name.slice(1)}** commands\n`;

      for (let option of command.options) {
        helpText += `- \`/${option.name}\`  ${option.description}\n`;
      }
    }

    const embed = await bot.embedHelper.getBaseEmbed();
    embed.setTitle("Hiii, my name is Flora")
    embed.setDescription(helpText)
    return await interaction.reply({ embeds: [embed] });
  }
};