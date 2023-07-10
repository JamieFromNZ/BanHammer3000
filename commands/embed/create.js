const { SlashCommandBuilder, MessageCollector, PermissionsBitField, EmbedBuilder } = require('discord.js');
const toHex = require('colornames')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create')
        .setDescription('Create a custom embed to use')
        .setDMPermission(true)
        .setDefaultMemberPermissions(PermissionsBitField.ManageGuild),

    async execute(interaction, bot) {
        // Guard: Check if member has perms to run cmd
        if (!await interaction.member.permissions.has(PermissionsBitField.ManageGuild)) {
            let emb = await bot.embedManager.getErrorEmbed();
            emb.setTitle("Error")
            emb.setDescription("You require the \`MANAGE_SERVER\` or \``ADMINISTRATOR\` permissions to run this command.");

            return await interaction.reply({ embeds: [emb], ephemeral: true });
        }

        let embedData = new EmbedBuilder();

        const channel = interaction.channel;
        const author = interaction.user;
        console.log(interaction.guild.id);
        let guild = await bot.databaseManager.getObject('guild', { guildId: interaction.guild.id });
        let questionIndex = 0;
        let embedName = " ";

        const questions = [
            `${bot.CONSTANTS.emojis[Math.floor(Math.random() * bot.CONSTANTS.emojis.length)]} What should the title be?`,
            `${bot.CONSTANTS.emojis[Math.floor(Math.random() * bot.CONSTANTS.emojis.length)]} What should the description be?`,
            `${bot.CONSTANTS.emojis[Math.floor(Math.random() * bot.CONSTANTS.emojis.length)]} What should the color be? (Hex code or [one of these](https://f.cloud.github.com/assets/43438/643981/f57948a0-d381-11e2-99fd-197c44065564.png))`,
            `${bot.CONSTANTS.emojis[Math.floor(Math.random() * bot.CONSTANTS.emojis.length)]} What should the image URL be? (Answer \`none\` to skip)`,
            `${bot.CONSTANTS.emojis[Math.floor(Math.random() * bot.CONSTANTS.emojis.length)]} What should the thumbnail URL be? (Answer \`none\` tp skip)`,
            `${bot.CONSTANTS.emojis[Math.floor(Math.random() * bot.CONSTANTS.emojis.length)]} What should the name of the embed be?`
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
                // All questions answered, create and save the embed object to the database
                embedData = embedData.toJSON();
                // Add the name proptery to it so once we get all embeds for a guild, we can choose the one we want with its name
                embedData.name = embedName;
                let newEmbedsArray = await guild.embeds.push(embedData);
                await bot.databaseManager.updateObject('guild', { guildId: await interaction.guild.id, update: { embeds: newEmbedsArray } });

                // Send the final embed message
                await message.edit({ content: `Embed created with name \`${embedName}\`! Post it by running \`/send\`.`, embeds: [embedData] });
                return;
            }

            // Send the question for the index
            console.log(embedData.data);
            await message.edit({ content: questions[questionIndex], embeds: questionIndex === 0 ? [] : [embedData] });
        }

        // Function to handle the user's answer and update the embedData
        const handleAnswer = async (answer) => {
            if (answer !== 'none') {
                switch (questionIndex) {
                    case 0:
                        embedData.setTitle(answer);
                        break;
                    case 1:
                        embedData.setDescription(answer)
                        break;
                    case 2:
                        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

                        if (hexRegex.test(answer)) {
                            //
                        } else {
                            answer = toHex(answer);
                        }

                        embedData.setColor(answer ? answer : bot.CONSTANTS.embedColor);
                        break;
                    case 3:
                        embedData.setImage(answer);
                        break;
                    case 4:
                        embedData.setThumbnail(answer);
                        break;
                    case 5:
                        embedName = answer;
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