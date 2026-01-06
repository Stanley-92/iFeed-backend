const router = require('express').Router();
const auth = require('../middleware/auth');
const commentCtrl = require('../controllers/comment.controller');

router.post('/', auth, commentCtrl.addComment);
router.get('/:postId', auth, commentCtrl.getComments);
router.delete('/:id', auth, commentCtrl.deleteComment);

module.exports = router;
