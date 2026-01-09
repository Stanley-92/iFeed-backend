// firebaseAdmin.js
const admin = require('firebase-admin');

let serviceAccount;

if (process.env.NODE_ENV === 'production') {
    // On Render / production → use environment variable (recommended)
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
    // Local development → use file (easier)
    serviceAccount = require('../firebase-service-account.json');
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;