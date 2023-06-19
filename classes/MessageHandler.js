const { EmbedBuilder } = require('discord.js');

class MessageHandler {
    constructor(bot) {

    }

    async replyInteraction(content, interaction) {
        const embed = new EmbedBuilder()
            .setColor('#f7d4f7')
            .setDescription(content.text)
            .setTimestamp();

        if (content.image) {
            embed.setImage(content.image);
        }

        if (content.title) {
            embed.setTitle(content.title);
        }

        if (content.thumbnail) {
            embed.setThumbnail(content.thumbnail);
        }

        return await interaction.reply({ embeds: [embed], ephemeral: content.ephemeral, files: content.files });
    }
}

module.exports = MessageHandler;