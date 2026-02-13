require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Verification = require('./models/Verification');

const app = express();

// Proper CORS configuration (only once)
app.use(
    cors({
        origin: [
            'https://i-feed-frontend.vercel.app', // Your live frontend
            'http://localhost:5173',              // Vite dev server
            'http://localhost:3000'               // Local testing
        ],
        credentials: true
    })
);

app.use(express.json()); // Only once

// Debug Mongo URI (hides password)
console.log('MONGO_URI =', process.env.MONGO_URI.replace(/:.+@/, ':***@'));

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Nodemailer transporter (Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Must be a Gmail App Password
    }
});

// Generate 6-digit code
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification code
app.post('/send-code', async (req, res) => {
    console.log('Received /send-code request - body:', req.body); // Debug log

    const { email } = req.body;

    // === ADD VALIDATION ===
    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email is required'
        });
    }

    // Optional: basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid email format'
        });
    }

    const code = generateCode();

    try {
        // Save or update verification record
        await Verification.findOneAndUpdate(
            { email },
            { code, verified: false, expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
            { upsert: true, new: true }
        );

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your iFeed Verification Code',
            text: `Your verification code is: ${code}. It expires in 5 minutes.`
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: 'Verification code sent via email.' });
    } catch (err) {
        console.error('Error in /send-code:', err); // Better error logging
        res.status(500).json({ success: false, message: 'Failed to send code' });
    }
});

// Verify code
app.post('/verify-code', async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ success: false, message: 'Email and code are required' });
    }

    try {
        const record = await Verification.findOne({ email });
        if (!record) return res.json({ success: false, message: 'Code not found' });
        if (record.expiresAt < new Date()) return res.json({ success: false, message: 'Code expired' });
        if (record.code !== code) return res.json({ success: false, message: 'Invalid code' });

        record.verified = true;
        await record.save();

        res.json({ success: true });
    } catch (err) {
        console.error('Error in /verify-code:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Check verified status
app.post('/check-verified', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'leystan405@gmail.com' });
    }

    try {
        const record = await Verification.findOne({ email });
        res.json({ verified: !!record?.verified });
    } catch (err) {
        console.error('Error in /check-verified:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});