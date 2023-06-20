const { SlashCommandBuilder, EmbedBuilder, CommandInteractionOptionResolver } = require('discord.js');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create')
        .setDescription('Creates a new giveaway')
        .addChannelOption(option => option.setName('channel').setDescription('The channel to host the giveaway in').setRequired(true))
        .addStringOption(option => option.setName('prize').setDescription('The prize for the giveaway').setRequired(true))
        .addIntegerOption(option => option.setName('winners').setDescription('The number of winners').setRequired(true))
        .addStringOption(option => option.setName('duration').setDescription('Duration (1s, 2m, 3h, 4d)').setRequired(false))
        .addStringOption(option => option.setName('requirements').setDescription('Requirements to be displayed on embed').setRequired(false)),

    async execute(interaction, bot) {
        const channel = interaction.options.getChannel('channel');
        const prize = interaction.options.getString('prize');
        const duration = interaction.options.getString('duration');
        const winners = interaction.options.getInteger('winners');
        const requirements = interaction.options.getString('requirements');
        let descriptionString = `React with :tada: below to enter.\nWinner(s): **${winners}**`;

        console.log(channel.type);
        if (channel.type !== 0) return await interaction.reply({
            content: "Channel must be type `GUILD_TEXT`",
            ephemeral: true
        });

        let endsAt = new Date('2000-01-01'); // Set endsAt to be a date to be noticed later, must be date to parse into mongodb
        // If there is a duration, check if it is valid and turn it into a date object (endsAt)
        if (duration) {
            const durationInMs = ms(duration);

            // Check if duration is valid
            if (durationInMs < ms('10m') || durationInMs > ms('7d')) {
                return await interaction.reply({ content: 'Invalid duration. Duration must be more than 10 minutes and less than 7 days to save bot memory.', ephemeral: true });
            }

            endsAt = new Date();
            endsAt.setMilliseconds(endsAt.getMilliseconds() + durationInMs);
        }

        // Yes ik I'm doing if (duration) twice but this looks neater
        if (duration) {
            descriptionString = descriptionString + `\nEnds <t:${Math.floor(endsAt.getTime() / 1000)}:R>`;
        }

        // If the user specified requirements, put them into message
        if (requirements) {
            descriptionString = descriptionString + `\n\n${requirements}`
        }

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
        console.log(msg.id);

        // Add giveaway to DATABASE, this doesn't do any Discord stuff
        await bot.giveawayManager.createGiveaway(msg.id, interaction.user.id, channel.id, interaction.guild.id, prize, winners, endsAt, 0);
    }
};