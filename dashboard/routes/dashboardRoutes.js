const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const axios = require('axios');

// dashboard routes go here
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
    let guilds = [];
    let user = null;
    const isLoggedIn = !!req.session.accessToken;

    if (isLoggedIn) {
        if (!req.session.user) {
            // Get user data
            try {
                const response = await axios.get('https://discord.com/api/users/@me', {
                    headers: {
                        authorization: `Bearer ${req.session.accessToken}`
                    }
                });

                req.session.user = response.data;
                req.session.user.avatarURL = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
                user = req.session.user
            } catch (error) {
                console.error(error);
            }
        } else {
            user = req.session.user;
        }

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

        // We only want the guilds where the user has perms so filter out the guilds where the user doesn't have admin or manage srvr
        guilds = guilds.filter(guild => (guild.permissions & 0x8) !== 0);
    }

    // Render
    res.render('dashboard', { guilds, isLoggedIn, user }); // Pass isLoggedIn and user here
});

router.get('/dashboard/:guildId', ensureAuthenticated, async (req, res) => {
    const guildId = req.params.guildId;

    // You can now use the guildId to fetch server-specific data
    // Note that you may not have the necessary permissions to access this data depending on the user's role in the server

    // For demonstration purposes, we'll just render the guildId
    res.render('server', { guildId });
});

module.exports = router;
