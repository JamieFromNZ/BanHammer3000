const { SlashCommandBuilder, MessageEmbed, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove an embed from the guild database')
        .setDefaultMemberPermissions(PermissionsBitField.ManageGuild)
        .addStringOption(option => option.setName('name').setDescription('Name of the embed').setRequired(true)),

    async execute(interaction, bot) {
        // Guard: Check if member has perms to run cmd
        if (!await interaction.member.permissions.has(PermissionsBitField.ManageGuild)) {
            let emb = await bot.embedHelper.getErrorEmbed();
            emb.setTitle("Error");
            emb.setDescription("You require the \`MANAGE_SERVER\` or \``ADMINISTRATOR\` permissions to run this command.");

            return await interaction.reply({ embeds: [emb], ephemeral: true });
        }

        const guildId = interaction.guild.id;
        const guild = await bot.databaseManager.getObject('guild', { guildId: guildId });

        // Guard: Check if there are any embeds in the guild
        if (!guild.embeds || guild.embeds.length === 0) {
            return await interaction.reply('There are no custom embeds in this guild.');
        }

        const embedNames = guild.embeds.map((embed) => embed.name);

        const embedToRemove = embedNames.find((name) => name.toLowerCase() === interaction.options.getString('name').toLowerCase());

        // Guard: Check if the specified embed exists in the guild
        if (!embedToRemove) {
            return await interaction.reply('The specified embed does not exist in this guild.');
        }

        // Remove the embed from the guild's embed list
        const updatedEmbeds = guild.embeds.filter((embed) => embed.name.toLowerCase() !== embedToRemove.toLowerCase());

        // Update the guild's embed list in the database
        await bot.databaseManager.updateObject('guild', { guildId: guildId, update: { embeds: updatedEmbeds } });

        let emb = await bot.embedHelper.getBaseEmbed();
        emb.setTitle("Removed, thanks!");
        emb.setDescription(`The embed \`${embedToRemove}\` has been removed.`);

        return await interaction.reply({ embeds: [emb], ephemeral: true });
    },
};
