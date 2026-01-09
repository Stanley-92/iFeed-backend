// routes/auth.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator'); // if you use it

const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

// Optional: you can add rate limiting later
// const rateLimit = require('express-rate-limit');
// const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });

// REGISTER
router.post(
    '/register',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Please enter a valid email'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters')
    ],
    authController.register
);

// LOGIN
router.post('/login', authController.login);

// GET CURRENT USER (protected)
router.get('/me', protect, authController.getMe);

// REFRESH TOKEN
router.post('/refresh-token', authController.refreshToken);

// LOGOUT (optional - blacklisting or client-side only)
router.post('/logout', protect, authController.logout);

// PASSWORD RESET FLOW
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;