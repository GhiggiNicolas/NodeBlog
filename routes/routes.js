const express = require('express');
const postRoutes = require('./postRoutes');
const userRoutes = require('./userRoutes');
const auth = require('../middleware/auth');
const { checkLoginCookie } = require('../middleware/cookie');
const authController = require('../controllers/authController');
const router = express.Router();
const Post = require('../models/Post');
const Like = require('../models/Like');

router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().populate('user_id').sort({ updatedAt: -1 });

        for (const post of posts) {
            post.like_num = await Like.countDocuments({ post_id: post._id });
            post.likes = await Like.find({ post_id: post._id }).select('user_id');
        }

        res.render('index', {
            title: 'Home',
            user: req.user,
            posts: posts
        });
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).send('Error retrieving posts');
    }
});

router.get('/login', checkLoginCookie, (req, res) => {
    res.render('login', { message: "" });
});

router.post('/login', authController.loginUser);

router.get('/signup', checkLoginCookie, (req, res) => {
    res.render('signup', { message: "" });
});

router.post('/signup', authController.registerUser);

router.get('/logout', authController.logoutUser);

router.use('/post', auth, postRoutes);
router.use('/user', auth, userRoutes);

module.exports = router;
