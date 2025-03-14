module.exports = {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpireDay: process.env.JWT_EXPIRES_DAY,
    firebase: {
        serviceAccount: JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    },
    saltRounds: process.env.SALT_ROUNDS
}