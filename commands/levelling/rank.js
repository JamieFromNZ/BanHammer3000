const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Display a member\'s XP and level.')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('Who\'s XP / level would you like to view?')
                .setRequired(false)),

    async execute(interaction, bot) {
        // Get user object for person to get XP/level from
        let user = await interaction.options.getUser('member');
        if (!user) {
            user = interaction.user;
        }

        // Fetch the user's data from your database
        let member = await bot.databaseManager.getMember(user.id, interaction.guild.id);
        let xp = member.xp;
        // If no XP, return
        if (!xp || xp === 0) return await bot.messageHandler.replyInteraction({
            text: `I could not find any info in my database for this member.`,
            ephemeral: true
        },
            interaction
        );
        let level = bot.levellingManager.getLevelWithXP(xp);
        let nextLevelXP = bot.levellingManager.calculateXpForLevel(level + 1);
        let remainingXP = nextLevelXP - xp;

        let rankCardString = '';
        rankCardString += `**${user.username}**\n`;
        rankCardString += `XP: **${xp}**\n`;
        rankCardString += `XP to level up: **${remainingXP}**\n`;
        rankCardString += `Current level: **${level}**\n`;

        let avatarUrl = user.displayAvatarURL({ extension: 'png' });

        return await bot.messageHandler.replyInteraction({
            text: rankCardString,
            ephemeral: false,
            thumbnail: avatarUrl
        },
        interaction
        );
    }
};
