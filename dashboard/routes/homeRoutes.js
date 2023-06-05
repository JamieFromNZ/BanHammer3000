const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
    let user = null;
    const isLoggedIn = !!req.session.accessToken;

    if (isLoggedIn) {
        try {
            const response = await axios.get('https://discord.com/api/users/@me', {
                headers: {
                    authorization: `Bearer ${req.session.accessToken}`
                }
            });

            user = response.data;
            user.avatarURL = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
        } catch (error) {
            console.error(error);
            user = null;
        }
    }

    res.render('index', { isLoggedIn, user });
});

module.exports = router;
