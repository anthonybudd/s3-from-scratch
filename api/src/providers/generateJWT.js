const jwt = require('jsonwebtoken');
const moment = require('moment');
const fs = require('fs');

module.exports = (user, expires) => {
    const payload = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
    };

    let expiresIn = moment(new Date()).add(1, 'day').unix();
    if (Array.isArray(expires) && expires.length === 2) {
        expiresIn = moment(new Date()).add(expires[0], expires[1]).unix();
    } else if (typeof expires === 'string') {
        expiresIn = moment(expires, 'YYYY-MM-DD HH:mmZ').unix();
    }

    return jwt.sign(payload, fs.readFileSync(process.env.PRIVATE_KEY_PATH, 'utf8'), {
        expiresIn,
        algorithm: 'RS512',
    });
};
