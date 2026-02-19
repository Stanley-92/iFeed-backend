require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
const Verification = require('./models/Verification');

const app = express();

// ================= CORS =================
app.use(
    cors({
        origin: [
            'http://localhost:5173',
            'http://localhost:3000'
        ],
        credentials: true
    })
);

app.use(express.json());

// ================= MongoDB =================
if (!process.env.MONGO_URI) {
    console.error('MONGO_URI not defined');
    process.exit(1);
}

console.log('MONGO_URI loaded');

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// ================= Nodemailer =================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ================= API ROUTES =================

app.post('/send-code', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email is required'
        });
    }

    const code = generateCode();

    try {
        await Verification.findOneAndUpdate(
            { email },
            {
                code,
                verified: false,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000)
            },
            { upsert: true, new: true }
        );

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your iFeed Verification Code',
            text: `Your verification code is: ${code}. It expires in 5 minutes.`
        });

        res.json({ success: true, message: 'Verification code sent.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to send code' });
    }
});

app.post('/verify-code', async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({
            success: false,
            message: 'Email and code are required'
        });
    }

    try {
        const record = await Verification.findOne({ email });

        if (!record)
            return res.json({ success: false, message: 'Code not found' });

        if (record.expiresAt < new Date())
            return res.json({ success: false, message: 'Code expired' });

        if (record.code !== code)
            return res.json({ success: false, message: 'Invalid code' });

        record.verified = true;
        await record.save();

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/check-verified', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email required'
        });
    }

    try {
        const record = await Verification.findOne({ email });
        res.json({ verified: !!record?.verified });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

// ================= SERVE FRONTEND =================

// Serve Vue build files
app.use(express.static(path.join(__dirname, '../dist')));

// Catch all routes and send index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// ================= START SERVER =================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
});
