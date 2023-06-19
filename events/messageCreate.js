const { Events } = require('discord.js');

// Object to store the time of the last message for each member
let lastMessageTimes = new Map();

module.exports = {
    name: Events.MessageCreate,
    async execute(message, bot) {
        if (message.author.bot) return;
        let guild = await bot.databaseManager.getGuild(message.guild.id);
        var cacheKey = `${message.author.id}-${message.guild.id}`;

        if (guild.levellingEnabled === true) {
            await bot.databaseManager.getMember(message.author.id, message.guild.id).then(async member => {
                if (await member) {
                    console.log(await member);
                    let currentDate = new Date();
                    let lastActiveDate = new Date(member.lastActiveDate);
                    let streak = member.streak;
                    let xp = member.xp;
                    let currentLevel = bot.levellingManager.getLevelWithXP(xp);

                    console.log(`Current streak: ${streak}`);
                    console.log(`Current xp: ${xp}`);
                    console.log(`Current level: ${currentLevel}`);
                    console.log("Adding XP to member");

                    // Check if it's been at least a minute since the last message
                    let lastMessageTime = lastMessageTimes.get(cacheKey) || 0;
                    let minutesSinceLastMessage = (currentDate.getTime() - lastMessageTime) / (1000 * 60);
                    if (minutesSinceLastMessage >= 1) {
                        // Add random XP (2-4), increased by streak percentage
                        let xpGain = Math.floor(Math.random() * 4) + 2;
                        console.log(`${xpGain} xp is going to be added to member`);
                        xpGain += Math.floor(xpGain * (Math.min(streak, 10) / 10)); // add streak bonus, up to 100%
                        console.log(`Because of streak bonus, ${xpGain} is now going to be added`);
                        xp += xpGain;
                        console.log(`New XP: ${xp}`);
                    }

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

                    // Check if the user has enough XP to level up and if they are, do stuff
                    console.log(`XP required to level up is ${bot.levellingManager.calculateXpForLevel(currentLevel + 1) - xp}`)
                    if (bot.levellingManager.isLevelledUp(xp, currentLevel)) {
                        await message.react("🥳");
                        await message.channel.send(`:tada: Hooray <@${message.author.id}>, you just levelled up to level **${bot.levellingManager.getLevelWithXP(xp)}**! GG, you need ${bot.levellingManager.getNextLevelXP(xp)} xp more for the next level.`);
                    }

                    // Check if member obj has been updated locally
                    if ((await bot.databaseManager.getMember(message.author.id, message.guild.id)).xp === xp || (await bot.databaseManager.getMember(message.author.id, message.guild.id).xp) === streak) {
                        console.log("Member has not been updated locally so will not bother updating DB");
                    } else {
                        console.log("Member has been updated locally so will update in DB");
                        await bot.databaseManager.updateMember(message.author.id, message.guild.id, xp, streak);
                    }

                    // Update the time of the last message
                    lastMessageTimes.set(cacheKey, currentDate.getTime());
                } else {
                    await bot.databaseManager.addMember(message.author.id, message.guild.id);
                }
            });
        }
    },
};