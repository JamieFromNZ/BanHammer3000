const { SlashCommandBuilder, MessageCollector, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set')
        .setDescription('Set the welcome DM message')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionsBitField.ManageGuild),

    async execute(interaction, bot) {
        // Guard: Check if member has perms to run cmd
        if (!await interaction.member.permissions.has(PermissionsBitField.ManageGuild)) {
            let emb = await bot.embedHelper.getErrorEmbed();
            emb.setTitle("Error")
            emb.setDescription("You require the \`MANAGE_SERVER\` or \``ADMINISTRATOR\` permissions to run this command.");

            return await interaction.reply({ embeds: [emb], ephemeral: true });
        }

        let data = [
            " ",
            " "
        ];

        const channel = interaction.channel;
        const author = interaction.user;
        let questionIndex = 0;

        const questions = [
            `${bot.CONSTANTS.emojis[Math.floor(Math.random() * bot.CONSTANTS.emojis.length)]} What should the plain message me? (\`none\` to skip)`,
            `${bot.CONSTANTS.emojis[Math.floor(Math.random() * bot.CONSTANTS.emojis.length)]} Which embed should be used? (\`none\` to skip, run \`/embed list\` to see a list of all embeds)`,
        ];

        const filter = (message) => message.author.id === author.id;

        // Create the message collector
        const collector = channel.createMessageCollector({
            filter: filter,
            time: 60000,
            max: questions.length
        });

        collector.on('collect', async (m) => {
            handleAnswer(m.content);
        });

        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                // User did not respond within the time limit
                return await channel.send('Time is up. Command cancelled.');
            }
        });

        // Function to send the next question and collect the user's answer
        const askQuestion = async () => {
            if (questionIndex >= questions.length) {

                await bot.databaseManager.updateObject('guild', { guildId: await interaction.guild.id, update: { welcomeMsg: data } });

                // Send the final embed message
                await message.edit({ content: `${bot.CONSTANTS.emojis[Math.floor(Math.random() * bot.CONSTANTS.emojis.length)]} Welcome DM message set, test it with \`/welcomedm test\`.` });
                return;
            }

            // Send the question for the index
            await message.edit({ content: questions[questionIndex] });
        }

        // Function to handle the user's answer and update the embedData
        const handleAnswer = async (answer) => {
            if (answer !== 'none') {
                switch (questionIndex) {
                    case 0:
                        data[0] = answer;
                        break;
                    case 1:
                        data[1] = answer;
                        break;
                }
            }

            questionIndex++;
            askQuestion();
        };

        // Start the embed creation thing
        let message = await interaction.reply('Let\'s get started!');
        askQuestion();
    },
};