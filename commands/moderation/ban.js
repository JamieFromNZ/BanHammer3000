const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('BAN')
        .addUserOption(option =>
            option.setName('victim')
                .setDescription('Who can I squash for you today?')),

    async execute(interaction, bot) {
        let user = await interaction.options.getUser('victim');
    },
};