const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('end')
        .setDescription('Ends an existing giveaway')
        .addStringOption(option => option.setName('id').setDescription('The ID of the giveaway message.').setRequired(true)),

    async execute(interaction, bot) {
        // Guard: Check if member has perms to run cmd
        if (!await interaction.member.permissions.has(PermissionsBitField.ManageGuild)) {
            let emb = await bot.embedManager.getBaseEmbed();
            emb.setTitle("Error")
            emb.setDescription("You require the \`MANAGE_SERVER\` or \``ADMINISTRATOR\` permissions to run this command.");
            
            return await interaction.reply( { embeds: [emb], ephemeral: true } );
        }

        let messageId = await interaction.options.getString('id');

        // In Discord, when you retrieve a msg id, it'll show this: 949597432822521906-1126459180677603441, the first id is the channel id and second is the message id
        if (messageId.includes('-')) {
            messageId = messageId.split('-')[1];
        }

        // Get giveaway with msg id
        let giveaway = await bot.databaseManager.getObject("giveaway", { messageId: messageId });

        // This function deletes the giveaway from databse, I should rename it
        await bot.giveawayManager.endGiveaway(giveaway, bot);

        let channel = await interaction.guild.channels.cache.get(giveaway.channelId);
        let message = await channel.messages.fetch(messageId);

        await message.edit({ content: "Giveaway over." });

        await interaction.reply( { content: 'Giveaway ended successfully.', ephemeral: true } );
    }
};