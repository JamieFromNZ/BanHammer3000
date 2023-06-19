const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Displays the leaderboard for a guild.'),

    async execute(interaction, bot) {
        const leaderboard = await bot.databaseManager.getLeaderboard(interaction.guild.id);

        // Create a string that represents the leaderboard.
        let leaderboardString = '';
        for (let i = 0; i < leaderboard.length; i++) {
            leaderboardString += `${i + 1}. <@${leaderboard[i].userId}>: ${leaderboard[i].xp}\n`;
        }

        return await interaction.reply(leaderboardString);
    },
};