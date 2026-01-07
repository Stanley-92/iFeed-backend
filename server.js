// server.js
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const nodemailer = require('nodemailer')
const path = require('path')
const Verification = require('./models/Verification')  // Your Mongoose model

const app = express()

// --- CORS setup ---
app.use(cors({
    origin: [
        'https://i-feed-frontend.vercel.app', // Your live frontend
        'http://localhost:5173',               // Vite dev server
        'http://localhost:3000'                // Local backend
    ],
    credentials: true
}));

// Parse JSON requests
app.use(express.json())

// --------------------
// --- API ROUTES ---
// --------------------

// Send verification code
app.post('/send-code', async (req, res) => {
    const { email } = req.body
    const code = Math.floor(100000 + Math.random() * 900000).toString() // 6-digit code

    try {
        // Save or update in MongoDB
        await Verification.findOneAndUpdate(
            { email },
            { code, verified: false, expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
            { upsert: true }
        )

        // Send email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your iFeed Verification Code',
            text: `Your verification code is: ${code}. It expires in 5 minutes.`
        })

        res.json({ success: true, message: 'Verification code sent via email.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Server error' })
    }
})

// Verify code
app.post('/verify-code', async (req, res) => {
    const { email, code } = req.body

    try {
        const record = await Verification.findOne({ email })
        if (!record) return res.json({ success: false, message: 'Code not found' })
        if (record.expiresAt < new Date()) return res.json({ success: false, message: 'Code expired' })
        if (record.code !== code) return res.json({ success: false, message: 'Invalid code' })

        record.verified = true
        await record.save()

        res.json({ success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Server error' })
    }
})

// Check verified status
app.post('/check-verified', async (req, res) => {
    const { email } = req.body
    const record = await Verification.findOne({ email })
    res.json({ verified: record?.verified || false })
})

// --------------------
// --- Serve Vue frontend for all other routes ---
// --------------------
app.use(express.static(path.join(__dirname, 'frontend', 'dist')))
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'))
})

// --------------------
// --- Connect MongoDB ---
// --------------------
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB error:', err))

// --------------------
// --- Start server ---
// --------------------
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
