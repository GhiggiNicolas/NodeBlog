const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Post = require("../models/post");
const Like = require("../models/like");
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/image/post');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `post_${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024  // 2MB
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

router.get('/create', auth, (req, res) => {
    res.render('post_create', {
        title: 'Create post',
        user: req.user,
        errors: {},
        description: '',
    });
});

router.post('/store', auth, upload.single('image'), async (req, res) => {
    const errors = {};

    try {
        if (!req.body.description) {
            errors.description = 'Description is required';
        }

        if (!req.file) {
            errors.image = 'Image is required';
        }

        if (Object.keys(errors).length > 0) {
            return res.render('post_create', {
                title: 'Create post',
                user: req.user,
                errors,
                description: req.body.description,
                image: req.file ? req.file.filename : null
            });
        }

        let imagePath = req.file.filename;

        const newPost = new Post({
            description: req.body.description,
            image: imagePath,
            user_id: req.user._id,
        });

        await newPost.save();
        res.redirect('/');

    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).send('Error creating post');
    }
});

router.get('/:postId/edit', auth, async (req, res) => {
    const postId = req.params.postId;

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).send('Post not found');
        }

        res.render('post_edit', {
            title: 'Edit Post',
            user: req.user,
            post: post,
            errors: {},
            description: ''
        });
    } catch (err) {
        console.error('Error fetching post:', err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/update/:postId', auth, async (req, res) => {
    const postId = req.params.postId;
    const errors = {};

    try {
        if (!req.body.description || req.body.description.trim() === '') {
            errors.description = 'Description is required';
        }

        if (Object.keys(errors).length > 0) {
            const post = await Post.findById(postId);
            return res.render('post_edit', {
                title: 'Edit Post',
                user: req.user,
                post: post,
                errors: errors,
                description: req.body.description
            });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send('Post not found');
        }

        post.description = req.body.description;

        await post.save();

        res.redirect('/');

    } catch (err) {
        console.error('Error updating post:', err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/delete', auth, async (req, res) => {
    const postId = req.body.postId;

    if (!postId) {
        return res.status(400).send('Post ID not provided');
    }

    try {
        console.log(`Deleting post with ID: ${postId}`);

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send('Post not found');
        }

        if (post.image) {
            const imagePath = path.join('public', 'image', 'post', post.image);

            console.log(`Trying to delete image at: ${imagePath}`);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log(`Deleted image: ${imagePath}`);
            } else {
                console.log(`Image not found at path: ${imagePath}`);
            }
        }
        await Like.deleteMany({ post_id: postId });

        await Post.findByIdAndDelete(postId);

        res.redirect('/');
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/like/:postId', auth, async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.user._id;

        if (!postId) {
            return res.status(400).json({ success: false, error: 'Post ID missing' });
        }

        const existingLike = await Like.findOne({ post_id: postId, user_id: userId });

        let likeCount;

        if (existingLike) {
            await Like.deleteOne({ _id: existingLike._id });
            likeCount = await Like.countDocuments({ post_id: postId });
            return res.json({ success: true, liked: false, like_count: likeCount });
        } else {
            const newLike = new Like({
                post_id: postId,
                user_id: userId
            });
            await newLike.save();
            likeCount = await Like.countDocuments({ post_id: postId });
            return res.json({ success: true, liked: true, like_count: likeCount });
        }
    } catch (err) {
        console.error('Error while managing like:', err);
        res.status(500).json({ success: false, error: 'Error in liking' });
    }
});

module.exports = router;
