const { SlashCommandBuilder, ChannelMentionable, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('toggle')
        .setDescription('Toggles the ping-on-join (poj) for a channel.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to enable or disable the "poj" feature')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionsBitField.ManageGuild)
        .setDMPermission(false), 

    async execute(interaction, bot) {
        // Check if member has appropriate perms]
        if (!await interaction.member.permissions.has(PermissionsBitField.ManageGuild)) {
            let emb = await bot.embedHelper.getErrorEmbed();
            emb.setTitle("Error")
            emb.setDescription("You require the \`MANAGE_SERVER\` or \``ADMINISTRATOR\` permissions to run this command.");

            return await interaction.reply({ embeds: [emb], ephemeral: true });
        }

        const channel = await interaction.options.getChannel('channel');

        // Channel type must be a text channel.
        if (channel.type !== 0) {
            let emb = await bot.embedHelper.getErrorEmbed();
            emb.setTitle("Error")
            emb.setDescription("Channel type must be text channel.");

            return await interaction.reply({ embeds: [emb], ephemeral: true });
        }

        const guildId = await interaction.guild.id;
        const guildSettings = await bot.databaseManager.getObject('guild', { guildId });

        // Check if the channel is already enabled
        if (guildSettings.pojChannels.includes(channel.id)) {
            // Disable poj for the channel
            guildSettings.pojChannels = guildSettings.pojChannels.filter(id => id !== channel.id);
        } else {
            // Enable poj for the channel
            guildSettings.pojChannels.push(channel.id);
        }

        // Update the guild settings in the database
        await bot.databaseManager.updateObject('guild', { guildId, update: guildSettings });

        // Send the response message
        const status = guildSettings.pojChannels.includes(channel.id) ? 'enabled' : 'disabled';

        // Get list of oall channels with poj enabled
        let pojChannels = guildSettings.pojChannels
        .map(channelId => `<#${channelId}>`)
        .join(', ');

        if (pojChannels == "") {
            pojChannels = "*None*";
        }

        const embed = await bot.embedHelper.getBaseEmbed();
        embed.setTitle("Success!")
        embed.setDescription(`Ping on join has been **${status}** for channel <#${channel.id}>.\n\n${bot.CONSTANTS.emojis[Math.floor(Math.random() * bot.CONSTANTS.emojis.length)]} **Current POJ channels:**\n ${pojChannels}`)

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
};
