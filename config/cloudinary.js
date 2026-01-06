const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'xxx',
    api_key: 'xxx',
    api_secret: 'xxx'
});

module.exports = cloudinary;
