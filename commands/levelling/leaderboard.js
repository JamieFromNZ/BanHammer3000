const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Displays the leaderboard for a guild.'),

    async execute(interaction, bot) {
        const leaderboard = await bot.databaseManager.getLeaderboardForGuild(interaction.guild.id, 'xp');

        // Create a string that represents the leaderboard.
        let leaderboardString = '';
        for (let i = 0; i < leaderboard.length; i++) {
            leaderboardString += `\`${i + 1}.\` <@${leaderboard[i].userId}>: Level **${bot.levellingManager.getLevelWithXP(leaderboard[i].xp)}** with a streak of ${leaderboard[i].streak} days.\n`;
        }

        return await bot.messageHandler.replyInteraction({
            text: leaderboardString,
            ephemeral: false
        },
        interaction
        );
    },
};
