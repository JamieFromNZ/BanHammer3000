const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message, bot) {
        if (message.author.bot) return;
        let guild = await bot.databaseManager.getGuild(message.guild.id);

        // Handle levelling
        // Check if guild has levelling enabled

        await bot.databaseManager.getUser(message.author.id).then(user => {
            if (user) {
                let currentDate = new Date();
                let lastActiveDate = new Date(user.lastActiveDate);
                let streak = user.streak;

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

                bot.databaseManager.updateUser(message.author.id, user.level, streak);
            } else {
                bot.databaseManager.addUser(message.author.id);
            }
        });
    },
};