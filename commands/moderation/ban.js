const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

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
            return await bot.messageHandler.replyInteraction(
                {
                    text: `Sorry, I don't have the permissions to ban members. Fix by giving me a role that has the permission \`BAN_MEMBERS\``,
                    ephemeral: true
                },
                interaction
            );
        }

        let bannerMember = await interaction.guild.members.cache.get(interaction.user.id);

        // Check if the person running the command actually has perms to run it
        if (!await bannerMember.permissions.has([PermissionsBitField.Flags.BanMembers])) {
            return await bot.messageHandler.replyInteraction(
                {
                    text: `Sorry, you need \`BAN_MEMBERS\` to run this command.`,
                    ephemeral: true
                },
                interaction
            );
        };

        let target = await interaction.options.getUser('victim');

        // Check if a target is specified
        if (!target) {
            return await bot.messageHandler.replyInteraction({
                text: `You didn't specify a victim.`,
                ephemeral: true
            },
                interaction
            );
        }

        // Check if the user is trying to ban themselves
        if (interaction.user.id === target.id) return await bot.messageHandler.replyInteraction({ text: `Wait what you can't ban yourself! >:(` }, interaction);

        // Check if the user is trying to ban the bot
        if (target.id === bot.client.user.id) return await bot.messageHandler.replyInteraction({ text: `Wait let's talk about this...` }, interaction);

        let victimMember = await interaction.guild.members.cache.get(target.id);

        // The person can only ban a moderator if they have admin themselves (are owner). Might remove later
        if (await victimMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return await bot.messageHandler.replyInteraction({
                text: `Sorry, can't ban because ${target.username} has administrator perms.`,
                ephemeral: true
            },
                interaction
            );
        }

        // The bot cannot ban any member that has a higher role than it anyway
        if (await interaction.guild.members.me.roles.highest.position <= await victimMember.roles.highest.position) {
            return await bot.messageHandler.replyInteraction({
                text: `Sorry, can't ban because ${target.username}'s highest role is above mine.`,
                ephemeral: true
            },
                interaction
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
                await interaction.followUp({ content: `Could not send DM to ${target.username}.`, ephemeral: true }); // Log the error for debugging
            }

            // Ban the user
            await victimMember.ban({ reason });
            await bot.messageHandler.replyInteraction(
                { text: `<@${target.id}> (\`${target.id}\`, \`${target.username}\`) has been banned.${reason ? ` Reason: ${reason}` : ''}`, ephemeral: false, image: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExYjEyNzlhOTExYWUzZjVlMzY1N2RlOTI4NzdjODVjNzRiNGY2M2JmZCZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/fe4dDMD2cAU5RfEaCU/giphy.gif' },
                interaction
            );

        } catch (error) {
            await bot.messageHandler.replyInteraction({ text: `Sorry, an error occurred while trying to ban ${target.username}.`, ephemeral: true }, interaction);
            console.error(error); // Log the error for debugging
        }
    },
};