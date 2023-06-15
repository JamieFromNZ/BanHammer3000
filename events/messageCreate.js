const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message, bot) {
        if (message.author.bot) return;
        let guild = await bot.databaseManager.getGuild(message.guild.id);

        // Handle levelling
        // Check if guild has levelling enabled
        if (guild.levellingEnabled === true) {
            await bot.databaseManager.getMember(message.author.id, message.guild.id).then(member => {
                if (member) {
                    let currentDate = new Date();
                    let lastActiveDate = new Date(member.lastActiveDate);
                    let streak = member.streak;
    
                    // Check if the last active date was yesterday
                    if (lastActiveDate.getDate() === currentDate.getDate() - 1 &&
                        lastActiveDate.getMonth() === currentDate.getMonth() &&
                        lastActiveDate.getFullYear() === currentDate.getFullYear()) {
                        streak++;
                    } else if (lastActiveDate.getDate() !== currentDate.getDate() ||
                        lastActiveDate.getMonth() !== currentDate.getMonth() ||
                        lastActiveDate.getFullYear() !== currentDate.getFullYear()) {
                        streak = 0;
                    }
    
                    bot.databaseManager.updateMember(message.author.id, member.level, streak);
                } else {
                    bot.databaseManager.addMember(message.author.id, message.gulid.id);
                }
            });
        }
    },
};