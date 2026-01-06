const mongoose = require('mongoose')

const verificationSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    code: { type: String, required: true },
    verified: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true }
})

module.exports = mongoose.model('Verification', verificationSchema)