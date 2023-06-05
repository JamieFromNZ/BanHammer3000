const axios = require('axios');

async function fetchUser(req, res, next) {
    const isLoggedIn = !!req.session.accessToken;

    if (isLoggedIn && !req.session.user) {
        try {
            const response = await axios.get('https://discord.com/api/users/@me', {
                headers: {
                    authorization: `Bearer ${req.session.accessToken}`
                }
            });

            req.session.user = response.data;
            req.session.user.avatarURL = `https://cdn.discordapp.com/avatars/${response.data.id}/${response.data.avatar}.png`;
        } catch (error) {
            console.error(error);
        }
    }

    next();
}

module.exports = fetchUser;