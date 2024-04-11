const crypto = require('crypto');

module.exports = (err, res) => {
    if (err.isAxiosError) {
        console.log(`Axios Error: ${err.request.path}`);
        if (err.response && err.response.data) {
            console.log(err.response.data);
        } else {
            console.error(err);
        }
    } else if (err.response && err.response.body) {
        console.error(err);
        console.error(err.response.body);
    } else {
        console.error(err);
    }

    if (res && !res.headersSent) res.status(500).json({
        msg: `Error`,
        code: crypto.randomBytes(32).toString('base64'),
    });
};
