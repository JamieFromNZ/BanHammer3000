const express = require('express');
const session = require('express-session');
const path = require('path');
const axios = require('axios');
const app = express();

// Utils and stuff
require('dotenv').config();

async function dashboardInit(bot) {
    // Set 'views' directory for any views 
    // being rendered res.render()
    app.set('views', path.join(__dirname, 'views'));

    // Set view engine as EJS
    app.set('view engine', 'ejs');

    // Public folder contains js, css, images
    app.use(express.static(path.join(__dirname, 'public')));

    //
    app.use(session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: 'auto' }
    }));

    // Routes
    app.get('/', async (req, res) => {
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
    
    

    app.get('/dashboard', (req, res) => {
        res.render('dashboard');
    });

    const clientId = '1113355752350957578';
    const clientSecret = process.env.CLIENT_SECRET;
    const redirectUri = 'http://localhost:3000/auth/discord/callback';
    const scope = 'identify%20guilds';

    app.get('/auth/discord', (req, res) => {
        res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`);
    });

    app.get('/auth/discord/callback', async (req, res) => {
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

    // Listen on port 3000
    app.listen(3000, () => {
        console.log('Server is running on port 3000, http://localhost:3000');
    });
}

module.exports = dashboardInit;