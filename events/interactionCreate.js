const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, bot) {
        if (await interaction.isChatInputCommand()) {
            // If the command was executed in DMs
            if (!interaction.guild) return await bot.messageHandler.replyInteraction({
                text: `For now, you can only run this command in a guild.`,
                ephemeral: false
            },
                interaction
            );

            // If slash command
            // Get command path with name
            const path = await bot.commandManager.commandPathsMap.get(interaction.commandName);
            const command = await require('../' + path);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }
    
            try {
                await command.execute(interaction, bot);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        } else {
            // If other (button, etc)
        }
    },
};