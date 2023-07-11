const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('List all custom embeds for the guild')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionsBitField.ManageGuild),

    async execute(interaction, bot) {
        // Guard: Check if member has perms to run cmd
        if (!await interaction.member.permissions.has(PermissionsBitField.ManageGuild)) {
            let emb = await bot.embedHelper.getErrorEmbed();
            emb.setTitle("Error");
            emb.setDescription("You require the \`MANAGE_SERVER\` or \``ADMINISTRATOR\` permissions to run this command.");

            return await interaction.reply({ embeds: [emb], ephemeral: true });
        }

        let guild = await bot.databaseManager.getObject('guild', { guildId: interaction.guild.id });

        // Check if the guild has any embeds
        if (!guild.embeds || guild.embeds.length === 0) {
            return await interaction.reply({ content: 'No custom embeds found in this guild. Make one with \`/create\`.', ephemeral: true });
        }

        let embedString = " ";

        // Add each embed name to the list
        guild.embeds.forEach(embedData => {
            embedString = embedString + '\n**\`' + embedData.name + '\`**';
        });

        // Build the list embed
        const embed = await bot.embedHelper.getBaseEmbed();
        embed.setDescription(embedString);

        await interaction.reply({ embeds: [embed] });
    },
};