const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');
const homeRoutes = require('./routes/homeRoutes');

// Utils and stuff
require('dotenv').config();

async function dashboardInit(bot) {
    // Set 'views' directory for any views 
    // being rendered res.render()
    app.set('views', path.join(__dirname, 'views'));

    // So I keep the bot object
    app.bot = bot;

    // Set template html thingy to EJS
    app.set('view engine', 'ejs');

    // Public folder contains js, css, images
    app.use(express.static(path.join(__dirname, 'public')));

    // parse application/x-www-form-urlencoded
    app.use(express.urlencoded({ extended: false }));

    // parse application/json
    app.use(express.json());

    // Setting up session
    app.use(session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: 'auto' }
    }));

    // Routes to be used
    app.use(dashboardRoutes);
    app.use(authRoutes);
    app.use(homeRoutes);

    // Listen on port 3000
    app.listen(3000, () => {
        console.log('Server is running on port 3000, http://localhost:3000');
    });
}

module.exports = dashboardInit;