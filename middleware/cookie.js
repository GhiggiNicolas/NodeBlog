const User = require('../models/user');

const checkLoginCookie = async (req, res, next) => {
    if (!req.cookies || !req.cookies['user_id']) {
        return next(); // Se il cookie non esiste, passa al middleware successivo
    }

    const userId = req.cookies['user_id'];

    try {
        const user = await User.findById(userId);

        if (user) {
            req.session.user = user;
            return res.redirect('/');
        }
    } catch (error) {
        console.error('Errore durante la verifica del cookie:', error);
    }

    next();
};

module.exports = { checkLoginCookie }