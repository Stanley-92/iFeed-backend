require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const nodemailer = require('nodemailer')
const Verification = require('./models/Verification')

const app = express()
app.use(cors())
app.use(express.json())

// Debug
console.log('MONGO_URI =', process.env.MONGO_URI)

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log(' MongoDB connected'))
    .catch(err => console.error(' Mongo error:', err))

// Nodemailer transporter (Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // your Gmail
        pass: process.env.EMAIL_PASS  // Gmail App Password
    }
})

// Generate 6-digit code
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send verification code
app.post('/send-code', async (req, res) => {
    const { email } = req.body
    const code = generateCode()

    try {
        // Save or update in MongoDB
        await Verification.findOneAndUpdate(
            { email },
            { code, verified: false, expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
            { upsert: true }
        )

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your iFeed Verification Code',
            text: `Your verification code is: ${code}. It expires in 5 minutes.`
        }

        await transporter.sendMail(mailOptions)

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

// Check verified (for login)
app.post('/check-verified', async (req, res) => {
    const { email } = req.body
    const record = await Verification.findOne({ email })
    res.json({ verified: record?.verified || false })
})

// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
