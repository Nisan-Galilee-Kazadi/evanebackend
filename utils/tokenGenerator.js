const crypto = require('crypto');

// Generate unique token
const generateToken = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `EL-${timestamp}-${random}`;
};

module.exports = {
    generateToken
};
