const { EmbedBuilder } = require('discord.js');

class MessageHandler {
    constructor(bot) {

    }

    async replyInteraction(content, interaction) {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setDescription(content.text)
            .setTimestamp();

        if (content.image) {
            embed.setImage(content.image);
        }

        if (content.title) {
            embed.setTitle(content.title);
        }

        return await interaction.reply({ embeds: [embed], ephemeral: content.ephemeral });
    }
}

module.exports = MessageHandler;