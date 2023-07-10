const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member, bot) {
        // Fetch the guild settings from the database
        const guildId = await member.guild.id;
        const guildSettings = await bot.databaseManager.getObject('guild', { guildId });

        // Check if "POJ" feature is enabled for any channels
        if (guildSettings.pojChannels.length > 0) {
            // Send a "POJ" message to each enabled channel
            for (const channelId of guildSettings.pojChannels) {
                let channel = await member.guild.channels.cache.get(channelId);

                // Guard: Check if the channel is valid and accessible
                if (!channel) continue;

                // Send the "POJ" message
                let msg = await channel.send(`<@${member.id}>`);

                // Delete "POJ" ping message
                await msg.delete();
            }
        }
    },
};
