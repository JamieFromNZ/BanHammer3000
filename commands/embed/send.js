const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('send')
        .setDescription('Send a custom embed')
        .setDMPermission(false)
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

        const embedName = await interaction.options.getString('name');

        let guild = await bot.databaseManager.getObject('guild', { guildId: await interaction.guild.id });

        // Find the embed with the specified name in the guild's embeds array
        const embedData = guild.embeds.find(embed => embed.name === embedName);

        if (!embedData) {
            return await interaction.reply(`Embed with name \`${embedName}\` not found.`);
        }

        await interaction.reply({ content: 'Sent! c:', ephemeral: true });

        return await interaction.channel.send({ embeds: [embedData] });
    },
};