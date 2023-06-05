const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
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
                user = req.session.user;
            } catch (error) {
                console.error(error);
            }
        }
    }

    res.render('index', { isLoggedIn, user });
});

module.exports = router;
