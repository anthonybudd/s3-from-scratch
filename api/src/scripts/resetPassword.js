
/**
 * node ./src/scripts/resetPassword.js --userID="c4644733-deea-47d8-b35a-86f30ff9618e" --password="password"
 * docker exec -ti s3-api node ./src/scripts/resetPassword.js --userID="c4644733-deea-47d8-b35a-86f30ff9618e" --password="password"
 *
 */
require('dotenv').config();
const generateJWT = require('./../providers/generateJWT');
const argv = require('minimist')(process.argv.slice(2));
const { User, Group } = require('./../models');
const db = require('./../providers/db');
const bcrypt = require('bcrypt-nodejs');

if (!argv['userID']) throw Error('You must provide --userID argument');
if (!argv['password']) throw Error('You must provide --password argument');

(async function Main() {
    try {
        const user = await User.findByPk(argv['userID']);

        await user.update({
            password: bcrypt.hashSync(argv['password'], bcrypt.genSaltSync(10)),
            passwordResetKey: null
        });

        console.log(`Password updated`);
    } catch (err) {
        console.error(err);
    } finally {
        db.connectionManager.close();
    }
})();
