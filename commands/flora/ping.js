const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot\'s latency and other info.'),

  async execute(interaction, bot) {
    let start = Date.now();

    await interaction.reply("Pinging...");

    const end = Date.now();
    const ping = end - start;
    const apiPing = bot.client.ws.ping;

    const embed = await bot.embedHelper.getBaseEmbed();
    embed.setTitle("Pong!")
    embed.addFields(
        { name: 'Latency', value: `${ping}ms` },
        { name: 'API Latency', value: `${apiPing}ms`, inline: true },
    )
    return await interaction.editReply({ embeds: [embed], content: " " });
  }
};