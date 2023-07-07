const { EmbedBuilder } = require('discord.js');

class EmbedHelper {
    constructor(bot) {
        this.bot = bot;
    }

    async getBaseEmbed() {
        let emb = new EmbedBuilder() 
        .setTimestamp()
        .setColor(this.bot.CONSTANTS.embedColor)

        return await emb;
    }
}

module.exports = EmbedHelper;