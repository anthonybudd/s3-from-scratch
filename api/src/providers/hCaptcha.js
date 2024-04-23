const axios = require('axios');
const qs = require('qs');

const hCaptcha = axios.create({
    baseURL: 'https://hcaptcha.com',
});

module.exports = {
    verify: async (response) => await hCaptcha.post('/siteverify',
        qs.stringify({
            response,
            secret: process.env.H_CAPTCHA_SECRET,
        }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    ),

    axios: hCaptcha,
};
