const express = require('express');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const User = require("../models/user");
const Post = require("../models/post");
const Like = require("../models/like");
const router = express.Router();

router.get('/', auth, (req, res) => {
    res.render('account', { title: req.user.username, user: req.user });
});

router.post('/update/username', auth, async (req, res) => {
    try {
        const { username } = req.body;

        if (!username || username.trim() === '') {
            return res.status(400).send('Username is required');
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).send('User not found');
        }

        user.username = username.trim();

        await user.save();

        req.session.user.username = user.username;

        res.redirect('/user');
    } catch (err) {
        console.error('Error updating username:', err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/update/password', auth, async (req, res) => {
    try {
        const { old_password, new_password, confirm_password } = req.body;

        if (!old_password || !new_password || !confirm_password) {
            return res.status(400).send('All password fields are required');
        }

        if (new_password !== confirm_password) {
            return res.status(400).send('New password and confirm password do not match');
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).send('User not found');
        }

        const isMatch = await bcrypt.compare(old_password, user.password);
        if (!isMatch) {
            return res.status(401).send('Old password is incorrect');
        }

        user.password = new_password;
        await user.save();

        req.session.user = user;

        res.redirect('/user');
    } catch (err) {
        console.error('Error updating password:', err);
        res.status(500).send('Internal Server Error');
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/image/account');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `user_${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB
    },
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

router.post('/update/image', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('Image upload failed');
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send('User not found');
        }

        const uploadDir = path.join('public', 'image', 'account');
        const oldImagePath = user.image ? path.join(uploadDir, user.image) : null;

        if (oldImagePath && fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
        }

        user.image = req.file.filename;
        await user.save();

        req.session.user.image = user.image;

        res.redirect('/user');
    } catch (err) {
        console.error('Error updating image:', err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/delete', auth, async (req, res) => {
    try {
        const userId = req.user._id;
        const { delete_password } = req.body;

        if (!delete_password) {
            return res.status(400).json({ error: 'Password is required.' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const isPasswordCorrect = await bcrypt.compare(delete_password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ error: 'Incorrect password.' });
        }

        if (user.image) {
            const profileImagePath = path.join('public', 'image', 'account', user.image);
            fs.unlink(profileImagePath, (err) => {
                if (err) console.error(`Error deleting profile image: ${profileImagePath}`, err);
            });
        }

        await Like.deleteMany({ user_id: userId });

        const userPosts = await Post.find({ user_id: userId });

        for (const post of userPosts) {
            await Like.deleteMany({ post_id: post._id });
            if (post.image) {
                const postImagePath = path.join('public', 'image', 'post', post.image);
                if (fs.existsSync(postImagePath)) {
                    fs.unlinkSync(postImagePath);
                    console.log(`Deleted image: ${postImagePath}`);
                } else {
                    console.log(`Image not found at path: ${postImagePath}`);
                }
            }
        }

        await Post.deleteMany({ user_id: userId });

        await User.findByIdAndDelete(userId);

        res.redirect('/logout');
    } catch (error) {
        console.error('Error during user deletion:', error);
        res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
});

module.exports = router;
