const express = require('express');
const router = express.Router();
const axios = require('axios');

// Utils and stuff
require('dotenv').config();

// Middleware
const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const fetchUser = require('../middleware/fetchUser');

// dashboard routes will go here
router.get('/dashboard', ensureAuthenticated, fetchUser, async (req, res) => {
    let guilds = [];
    let user = req.session.user;
    const isLoggedIn = !!req.session.accessToken;

    // get the guilds the bot is in
    let botGuilds = req.app.bot.client.guilds.cache.map(guild => guild.id);

    // Get user's guild data
    try {
        const response = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                authorization: `Bearer ${req.session.accessToken}`
            }
        });

        guilds = response.data;
    } catch (error) {
        console.error(error);
    }

    // Filter only guilds where user has perms
    guilds = guilds.filter(guild => (guild.permissions & 0x8) !== 0);

    // Add if the bot is in the guild or not to each guild obj
    guilds = guilds.map(guild => ({ ...guild, botIsInGuild: botGuilds.includes(guild.id) }));

    res.render('dashboard', { guilds, isLoggedIn, user });
});

router.get('/dashboard/:guildId', ensureAuthenticated, fetchUser, async (req, res) => {
    // Get guild object with id by sending request
    const guildId = req.params.guildId;
    // Get Discord Guild
    let guild = await req.app.bot.client.guilds.cache.get(guildId);
    // Get Guild info from db
    let guildDB = await req.app.bot.databaseManager.getGuild(guildId);
    // Get user
    let user = req.session.user;
    // if the user is logged in
    const isLoggedIn = !!req.session.accessToken;

    await res.render('server', { user, isLoggedIn, guild, guildDB });
});

router.post('/dashboard/:guildId/settings', ensureAuthenticated, fetchUser, async (req, res) => {
    // Get guild id from params
    const guildId = req.params.guildId;

    // Get levellingEnabled from form data
    const levellingEnabled = req.body.myRadio === 'true';

    console.log(levellingEnabled, guildId);

    // Update guild settings in database
    try {
        await req.app.bot.databaseManager.updateGuild(guildId, levellingEnabled);
    } catch (error) {
        console.error('Error updating settings:', error);
    }

    // Redirect back to the settings page
    res.redirect(`/dashboard/${guildId}`);
});

module.exports = router;
