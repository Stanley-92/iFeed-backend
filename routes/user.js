const router = require('express').Router();
const auth = require('../middleware/auth');
const userCtrl = require('../controllers/user.controller');

router.get('/me', auth, userCtrl.getProfile);
router.put('/me', auth, userCtrl.updateProfile);
router.delete('/me', auth, userCtrl.deleteAccount);

module.exports = router;
