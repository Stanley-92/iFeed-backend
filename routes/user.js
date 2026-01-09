const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  createProfile, // your existing endpoint
} = require('../controllers/user.controller');

router.post('/create-profile', createProfile); // maybe public (first time)

router.get('ProfileUser', protect, getProfile);           // ← protected
router.put('ProfileUser', protect, updateProfile);        // ← protected

module.exports = router;