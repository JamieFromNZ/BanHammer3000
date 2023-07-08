const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('update')
    .setDescription('Updates a giveaway')
    .addStringOption(option => option.setName('message_id').setDescription('The ID of the giveaway message to update').setRequired(true))
    .addStringOption(option => option.setName('prize').setDescription('The updated prize for the giveaway').setRequired(false))
    .addIntegerOption(option => option.setName('winners').setDescription('The updated number of winners').setRequired(false))
    .addStringOption(option => option.setName('duration').setDescription('Updated duration (1s, 2m, 3h, 4d)').setRequired(false))
    .addStringOption(option => option.setName('requirements').setDescription('Updated requirements to be displayed on embed').setRequired(false))
    .setDefaultMemberPermissions(PermissionsBitField.ManageGuild)
    .setDMPermission(false),

  async execute(interaction, bot) {
    const messageId = interaction.options.getString('message_id');

    // Guard: Check if member has the required permissions
    if (!interaction.member.permissions.has(PermissionsBitField.ManageGuild)) {
      let emb = await bot.embedManager.getBaseEmbed();
      emb.setTitle("Error");
      emb.setDescription("You require the `MANAGE_SERVER` or `ADMINISTRATOR` permissions to run this command.");
      return await interaction.reply({ embeds: [emb], ephemeral: true });
    }

    // Fetch the giveaway from the database
    const giveaway = await bot.databaseManager.getObject("giveaway", { messageId });

    // Guard: Check if the giveaway exists
    if (!giveaway) {
      return await interaction.reply({ content: 'Giveaway not found.', ephemeral: true });
    }

    // Get the updated properties from the options
    const optionsToUpdate = {
      prize: interaction.options.getString('prize'),
      winners: interaction.options.getInteger('winners'),
      duration: interaction.options.getString('duration'),
      requirements: interaction.options.getString('requirements')
    };

    // Update the giveaway properties
    const updatedProperties = {};

    if (optionsToUpdate.prize) {
      updatedProperties.prize = optionsToUpdate.prize;
    }

    if (optionsToUpdate.winners) {
      updatedProperties.winnerCount = optionsToUpdate.winners;
    }

    if (optionsToUpdate.duration) {
      const durationInMs = ms(optionsToUpdate.duration);
      const endsAt = new Date();
      endsAt.setMilliseconds(endsAt.getMilliseconds() + durationInMs);
      updatedProperties.endsAt = endsAt;
    }

    if (optionsToUpdate.requirements) {
      updatedProperties.requirements = optionsToUpdate.requirements;
    }

    // Save the updated properties to the giveaway object
    Object.assign(giveaway, updatedProperties);

    // Save the updated giveaway in the database
    await bot.databaseManager.updateObject("giveaway", { messageId, update: giveaway });

    // Create the updated description string
    let descriptionString = await bot.giveawayManager.getDescriptionString(giveaway.endsAt, giveaway.requirements, giveaway.winnerCount);

    // Update the giveaway message
    const channel = await interaction.guild.channels.fetch(giveaway.channelId);
    const message = await channel.messages.fetch(messageId);

    let embed = new EmbedBuilder()
      .setTitle(`🎉 ${giveaway.prize}`)
      .setDescription(descriptionString)
      .setColor(bot.CONSTANTS.embedColor);

    await message.edit({ embeds: [embed] });

    await interaction.reply( { content: 'Giveaway updated successfully.', ephemeral: true } );
  },
};