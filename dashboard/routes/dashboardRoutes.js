const express = require('express');
const router = express.Router();
const axios = require('axios');

// Middleware
const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const fetchUser = require('../middleware/fetchUser');

// dashboard routes will go here
router.get('/dashboard', ensureAuthenticated, fetchUser, async (req, res) => {
    let guilds = [];
    let user = req.session.user;
    const isLoggedIn = !!req.session.accessToken;

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

    guilds = guilds.filter(guild => (guild.permissions & 0x8) !== 0);
    
    res.render('dashboard', { guilds, isLoggedIn, user }); 
});

router.get('/dashboard/:guildId', ensureAuthenticated, fetchUser, async (req, res) => {
    // Get guild object with id
    const guildId = req.params.guildId;
    console.log(req.app);
    let guild = await req.app.bot.client.guilds.cache.get(guildId);

    let user = req.session.user;
    const isLoggedIn = !!req.session.accessToken;

    res.render('server', { user, isLoggedIn, guild });
});

module.exports = router;
