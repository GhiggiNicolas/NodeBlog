const User = require('../models/user');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const loginUser = async (req, res, next) => {
    const { email, password, remember_me } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).render('login', { message: 'Invalid credentials.' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).render('login', { message: 'Invalid credentials.' });
        }

        req.session.user = user;

        if(remember_me) {
            res.cookie('user_id', user.id, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
            });
        }

        res.redirect('/');
    } catch (error) {
        next(error);
    }
};

const registerUser = async (req, res, next) => {
    const { username, email, password, confirm_password } = req.body;

    if (password !== confirm_password) {
        return res.status(400).render('signup', { message: 'The passwords do not match.' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).render('signup', { message: 'Email already in use.' });
        }

        const newUser = new User({ username, email, password });

        await newUser.save();
        res.redirect('/login');
    } catch (error) {
        next(error);
    }
};

const logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Unable to log out. Try again.');
        }
        res.clearCookie('user_id');
        res.redirect('/login');
    });
};

const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

module.exports = {
    loginUser,
    registerUser,
    logoutUser,
    isAuthenticated
};
