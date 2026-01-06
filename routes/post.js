const router = require('express').Router();
const auth = require('../middleware/auth');
const postCtrl = require('../controllers/post.controller');

router.post('/', auth, postCtrl.createPost);
router.get('/', auth, postCtrl.getPosts);
router.put('/:id', auth, postCtrl.updatePost);
router.delete('/:id', auth, postCtrl.deletePost);

module.exports = router;
