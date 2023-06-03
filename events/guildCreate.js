const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildCreate,
    async execute(guild, bot) {
        let textChannels = await guild.channels.cache.filter(c => c.type === 'GUILD_TEXT');
        let topTextChannel = await textChannels.first();
        
        if (await topTextChannel) {
            await topTextChannel.send('Hello, world! Thank you for adding me to your server! Run \`/help\` to get a list of my commands.');
        }        
    },
};