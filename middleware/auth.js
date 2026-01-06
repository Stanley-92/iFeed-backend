const admin = require('../firebaseAdmin');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = await admin.auth().verifyIdToken(token);

    let user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
        user = await User.create({
            firebaseUid: decoded.uid,
            email: decoded.email,
            isVerified: decoded.email_verified
        });
    }

    req.user = user;
    next();
};
