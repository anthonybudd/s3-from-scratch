
/**
 * node ./src/scripts/forgotPassword.js --userID="c4644733-deea-47d8-b35a-86f30ff9618e"
 * docker exec -ti s3-api node ./src/scripts/forgotPassword.js --userID="c4644733-deea-47d8-b35a-86f30ff9618e"
 *
 */
require('dotenv').config();
const generateJWT = require('./../providers/generateJWT');
const argv = require('minimist')(process.argv.slice(2));
const { User, Group } = require('./../models');
const db = require('./../providers/db');
const crypto = require('crypto');

if (!argv['userID']) throw Error('You must provide --userID argument');

(async function Main() {
    try {
        const user = await User.findByPk(argv['userID']);

        const passwordResetKey = crypto.randomBytes(32).toString('base64').replace(/[^a-zA-Z0-9]/g, '');

        await user.update({ passwordResetKey });

        console.log(`\n\nEMAIL THIS TO THE USER\nPASSWORD RESET LINK: ${process.env.FRONTEND_URL}/reset/${passwordResetKey}\n\n`);
    } catch (err) {
        console.error(err);
    } finally {
        db.connectionManager.close();
    }
})();
