const express = require('express');
const router = express.Router();

// Middleware
const fetchUser = require('../middleware/fetchUser');

router.get('/', fetchUser, async (req, res) => {
    const user = req.session.user;
    const isLoggedIn = !!req.session.accessToken;

    res.render('index', { isLoggedIn, user });
});

module.exports = router;
