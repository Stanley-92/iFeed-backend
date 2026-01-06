const router = require('express').Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Post = require('../model/post');

router.delete('/post/:id', auth, admin, async (req, res) => {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted by admin' });
});

module.exports = router;
