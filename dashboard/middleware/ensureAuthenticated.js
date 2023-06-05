function ensureAuthenticated(req, res, next) {
    if (req.session.accessToken) {
        return next();
    }
    res.redirect('/auth/discord');
}

module.exports = ensureAuthenticated;