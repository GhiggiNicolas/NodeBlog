const mongoose = require('mongoose');

const Post = mongoose.models.Post || mongoose.model('Post', new mongoose.Schema({
    image: { type: String, required: true },
    description: { type: String },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true }));

module.exports = Post;
