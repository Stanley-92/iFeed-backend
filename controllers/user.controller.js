const User = require('../models/User');

// READ profile
exports.getProfile = async (req, res) => {
    res.json(req.user);
};

// UPDATE profile
exports.updateProfile = async (req, res) => {
    const { name, bio, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { name, bio, avatar },
        { new: true }
    );

    res.json(user);
};

// DELETE user
exports.deleteAccount = async (req, res) => {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted' });
};
