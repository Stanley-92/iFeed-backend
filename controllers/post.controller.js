const Post = require('../models/post')

// CREATE post
exports.createPost = async (req, res) => {
    const post = await Post.create({
        userId: req.user._id,
        caption: req.body.caption,
        media: req.body.media
    });
    res.json(post);
};

// READ all posts
exports.getPosts = async (req, res) => {
    const posts = await Post.find()
        .populate('userId', 'name avatar')
        .sort({ createdAt: -1 });

    res.json(posts);
};

// UPDATE post
exports.updatePost = async (req, res) => {
    const post = await Post.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { caption: req.body.caption },
        { new: true }
    );
    res.json(post);
};

// DELETE post
exports.deletePost = async (req, res) => {
    await Post.findOneAndDelete({
        _id: req.params.id,
        userId: req.user._id
    });
    res.json({ message: 'Post deleted' });
};
