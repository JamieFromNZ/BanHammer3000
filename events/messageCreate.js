const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message, bot) {
        if (message.author.bot) return;
        let guild = await bot.databaseManager.getGuild(message.guild.id);

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

                    // Add random XP (2-4), increased by streak percentage
                    let xpGain = Math.floor(Math.random() * 4) + 2;
                    console.log(`${xpGain} xp is going to be added to member`);
                    xpGain += Math.floor(xpGain * (Math.min(streak, 10) / 10)); // add streak bonus, up to 100%
                    console.log(`Because of streak bonus, ${xpGain} is now going to be added`);
                    xp += xpGain;
                    console.log(`New XP: ${xp}`);

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

                    await bot.databaseManager.updateMember(message.author.id, message.guild.id, xp, streak);
                } else {
                    await bot.databaseManager.addMember(message.author.id, message.guild.id);
                }
            });
        }
    },
};