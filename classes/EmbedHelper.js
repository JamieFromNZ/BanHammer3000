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

    async getErrorEmbed() {
        let emb = new EmbedBuilder() 
        .setTimestamp()
        .setColor("f24d55")

        return await emb;
    }
}

module.exports = EmbedHelper;