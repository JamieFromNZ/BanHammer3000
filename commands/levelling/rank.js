const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Display a member\'s XP and level.')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('Who\'s XP / level would you like to view?')
                .setRequired(false)),

    async execute(interaction, bot) {
        // Get user object for person to get XP/level from
        let user = await interaction.options.getUser('member');
        if (!user) {
            user = interaction.user;
        }
        //let memberObj = await interaction.guild.members.cache.get(user.id);

        // Fetch the user's data from your database
        let member = await bot.databaseManager.getMember(user.id, interaction.guild.id);
        let xp = member.xp;
        // If no XP, return
        if (!xp || xp === 0) return await bot.messageHandler.replyInteraction({
            text: `I could not find any info in my database for this member.`,
            ephemeral: true
        },
            interaction
        );
        let level = bot.levellingManager.getLevelWithXP(xp);
        let nextLevelXP = bot.levellingManager.calculateXpForLevel(level + 1);
        let remainingXP = nextLevelXP - xp;
        
        // Fetch the user's avatar
        let avatarUrl = user.displayAvatarURL({ extension: 'png' });

        // Create a canvas and get its 2d context
        let canvas = createCanvas(700, 250);
        let ctx = canvas.getContext('2d');

        // Draw the user's avatar
        loadImage(avatarUrl).then(avatar => {
            console.log(avatar, avatarUrl);
            ctx.drawImage(avatar, 25, 25, 200, 200);
        });

        // Set the font and color for the text
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;

        // Draw the user's name
        ctx.strokeText(user.username, 250, 75);
        ctx.fillText(user.username, 250, 75);

        // Draw the user's XP
        ctx.strokeText(`XP: ${xp}`, 250, 125);
        ctx.fillText(`XP: ${xp}`, 250, 125);

        // Draw the XP remaining to level up
        ctx.strokeText(`XP to level up: ${remainingXP}`, 250, 175);
        ctx.fillText(`XP to level up: ${remainingXP}`, 250, 175);

        // Draw a progress bar for the XP to the next level
        let progressBarWidth = 400;
        let progress = progressBarWidth * ((nextLevelXP - remainingXP) / nextLevelXP);
        ctx.fillRect(250, 225, progress, 20);
        ctx.strokeRect(250, 225, progressBarWidth, 20);

        // Convert the canvas to a buffer
        let buffer = canvas.toBuffer();

        // Create a new Discord message attachment with the buffer
        let attachment = new AttachmentBuilder(buffer, { name: 'rank-card.png'} );

        // Reply to the interaction with the rank card
        await interaction.reply({ files: [attachment] });
    }
};