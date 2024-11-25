const auth = async (req, res, next) => {
    if (req.session && req.session.user) {
        if (req.originalUrl === '/login' || req.originalUrl === '/signup') {
            return res.redirect('/');
        }
        req.user = req.session.user; 
        return next();
    } else {
        return res.redirect('/login');
    }
};

module.exports = auth;
