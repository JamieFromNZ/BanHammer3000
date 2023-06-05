const express = require('express');
const router = express.Router();
const axios = require('axios');

// Utils and stuff
require('dotenv').config();

const clientId = '1113355752350957578';
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = 'http://localhost:3000/auth/discord/callback';
const scope = 'identify%20guilds';

router.get('/auth/discord', (req, res) => {
    res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`);
});

router.get('/auth/discord/callback', async (req, res) => {
    const code = req.query.code;
    const data = {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: code
    };

    try {
        const response = await axios.post(`https://discord.com/api/oauth2/token`, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        req.session.accessToken = response.data.access_token;
        req.session.refreshToken = response.data.refresh_token;
        req.session.expiresIn = response.data.expires_in;

        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Authentication failed');
    }
});

module.exports = router;