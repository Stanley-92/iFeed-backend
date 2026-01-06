const Comment = require('.../models/Comment');

// CREATE comment / reply
exports.addComment = async (req, res) => {
    const comment = await Comment.create({
        postId: req.body.postId,
        userId: req.user._id,
        text: req.body.text,
        parentComment: req.body.parentComment || null
    });
    res.json(comment);
};

// READ comments of post
exports.getComments = async (req, res) => {
    const comments = await Comment.find({ postId: req.params.postId })
        .populate('userId', 'name avatar')
        .sort({ createdAt: 1 });

    res.json(comments);
};

// DELETE comment
exports.deleteComment = async (req, res) => {
    await Comment.findOneAndDelete({
        _id: req.params.id,
        userId: req.user._id
    });
    res.json({ message: 'Comment deleted' });
};
