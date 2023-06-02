const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('BAN')
        .addUserOption(option =>
            option.setName('victim')
                .setDescription('Who can I squash for you today?')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Why are you banning this person?')
                .setRequired(false)),

    async execute(interaction, bot) {
        // Check if bot has permissions to ban
        if (!await interaction.guild.members.cache.get(bot.client.user.id).permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return await interaction.reply({
                content: `Sorry, I don't have the permissions to ban members. Fix by giving me a role that has the permission \`BAN_MEMBERS\``,
                ephemeral: true
            });
        }
        
        let bannerMember = await interaction.guild.members.cache.get(interaction.user.id);

        // Check if the person running the command actually has perms to run it
        if (!await bannerMember.permissions.has([PermissionsBitField.Flags.BanMembers])) {
            return await interaction.reply({
                content: `Sorry, you need \`BAN_MEMBERS\` to run this command.`,
                ephemeral: true
            }
            );
        };

        let target = await interaction.options.getUser('victim');

        // Check if a target is specified
        if (!target) {
            return await interaction.reply({
                content: `You didn't specify a victim.`,
                ephemeral: true
            }
            );
        }

        // Check if the user is trying to ban themselves
        if (interaction.user.id === target.id) return await interaction.reply(`Wait what you can't ban yourself! >:(`);

        let victimMember = await interaction.guild.members.cache.get(target.id);

        // The person can only ban a moderator if they have admin themselves (are owner). Might remove later
        if (victimMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return await interaction.reply({
                content: `Sorry, can't ban because ${target.username} has administrator perms.`,
                ephemeral: true
            });
        }

        // The bot cannot ban any member that has a higher role than it anyway
        if (await interaction.guild.members.me.roles.highest.position <= await victimMember.roles.highest.position) {
            return await interaction.reply({
                content: `Sorry, can't ban because ${target.username}'s highest role is above mine.`,
                ephemeral: true
            }
            );
        }

        // Get the reason for the ban
        let reason = await interaction.options.getString('reason');

        // Perform the ban and handle any potential errors
        try {
            // Send a DM to the banned user
            try {
                await target.send(`You have been banned from ${interaction.guild.name}.${reason ? ` Reason: ${reason}` : ''}`);
            } catch (error) {
                await interaction.followUp( { content: `Could not send DM to ${target.username}.`, ephemeral: true }); // Log the error for debugging
            }

            await victimMember.ban({ reason });
            await interaction.reply({ content: `${target.username} has been banned.${reason ? ` Reason: ${reason}` : ''}`, ephemeral: false });
        } catch (error) {
            await interaction.reply({ content: `Sorry, an error occurred while trying to ban ${target.username}.`, ephemeral: true });
            console.error(error); // Log the error for debugging
        }
    },
};