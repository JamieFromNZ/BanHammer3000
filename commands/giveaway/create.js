const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create')
        .setDescription('Creates a new giveaway')
        .addChannelOption(option => option.setName('channel').setDescription('The channel to host the giveaway in').setRequired(true))
        .addStringOption(option => option.setName('prize').setDescription('The prize for the giveaway').setRequired(true))
        .addIntegerOption(option => option.setName('winners').setDescription('The number of winners').setRequired(true))
        .addStringOption(option => option.setName('duration').setDescription('Duration (1s, 2m, 3h, 4d)').setRequired(false))
        .addStringOption(option => option.setName('requirements').setDescription('Requirements to be displayed on embed').setRequired(false))
        .setDefaultMemberPermissions(PermissionsBitField.ManageGuild)
        .setDMPermission(false),

    async execute(interaction, bot) {
        const channel = interaction.options.getChannel('channel');
        const prize = interaction.options.getString('prize');
        const duration = interaction.options.getString('duration');
        const winners = interaction.options.getInteger('winners');
        const requirements = interaction.options.getString('requirements');

        // Guard: Check if member has perms to run cmd
        if (!await interaction.member.permissions.has(PermissionsBitField.ManageGuild)) {
            let emb = await bot.embedManager.getErrorEmbed();
            emb.setTitle("Error")
            emb.setDescription("You require the \`MANAGE_SERVER\` or \``ADMINISTRATOR\` permissions to run this command.");

            return await interaction.reply({ embeds: [emb], ephemeral: true });
        }

        // Guard 1: Channel type must be a text channel.
        if (channel.type !== 0) {
            let emb = await bot.embedManager.getErrorEmbed();
            emb.setTitle("Error")
            emb.setDescription("Channel type must be text channel.");

            return await interaction.reply({ embeds: [emb], ephemeral: true });
        }

        let endsAt = new Date('2000-01-01'); // Set endsAt to be a date to be noticed later, must be date to parse into mongodb

        if (duration) {
            const durationInMs = ms(duration);

            /*
            // Guard 2: Check if duration is inputted if if it is, check if it is valid (between 10m and 7d);
            if (durationInMs < ms('10m') || durationInMs > ms('7d')) {
                return await interaction.reply({ content: 'Invalid duration. Duration must be more than 10 minutes and less than 7 days to save bot memory.', ephemeral: true });
            }
            */

            endsAt = new Date();
            endsAt.setMilliseconds(endsAt.getMilliseconds() + durationInMs);
        }

        // Create the updated description string
        let descriptionString = await bot.giveawayManager.getDescriptionString(endsAt, requirements, winners);

        // tell user gw is being started
        await interaction.reply({
            content: `Starting giveaway in <#${channel.id}>!`,
            ephemeral: true
        });

        // Send giveaway message
        let embed = new EmbedBuilder()
            .setTitle(`:gift: ${prize}`)
            .setDescription(descriptionString)
            .setColor(bot.CONSTANTS.embedColor)

        let msg = await channel.send({ embeds: [embed] });
        await msg.react('🎉');

        // Add giveaway to DATABASE, this doesn't do any Discord stuff
        await bot.databaseManager.addObject("giveaway", { messageId: msg.id, userId: interaction.user.id, channelId: channel.id, guildId: interaction.guild.id, prize: prize, winnerCount: winners, endsAt: endsAt, members: 0 });
    }
};