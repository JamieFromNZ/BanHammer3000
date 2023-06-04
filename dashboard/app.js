const express = require('express');
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

    // Routes
    app.get('/', (req, res) => {
        res.render('index', {
            isLoggedIn: false
        });
    });

    app.get('/dashboard', (req, res) => {
        res.render('dashboard');
    });

    const clientId = '1113355752350957578';
    const clientSecret = process.env.CLIENT_SECRET;
    const redirectUri = 'http://localhost:3000/auth/discord/callback';

    app.get('/auth/discord', (req, res) => {
        const scope = 'identify%20gulids';
        res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`);
    });

    app.get('/auth/discord/callback', async (req, res) => {
        const code = req.query.code;
        const data = {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
            code: code,
            scope: 'identify email'
        };

        try {
            const response = await axios.post(`https://discord.com/api/oauth2/token`, data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            // The access token is available here: response.data.access_token
            // Use the access token to make requests to the Discord API

            res.send('Logged in!');
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