const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message, bot) {
        if (message.author.bot) return;
        //let guild = await bot.databaseManager.getGuild(message.guild.id);
        //var cacheKey = `${message.author.id}-${message.guild.id}`;


        if (message.author.id === "422603238936936450") {
            if (message.content === "!deleteAllGiveaways") {
                await bot.databaseManager.removeAllObjects("giveaway");
                await message.reply("Done");
            }
        }
    }
};