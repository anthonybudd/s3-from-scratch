
/**
 * node ./src/scripts/jwt.js --userID="c4644733-deea-47d8-b35a-86f30ff9618e"
 * docker exec -ti s3-api node ./src/scripts/jwt.js --userID="c4644733-deea-47d8-b35a-86f30ff9618e"
 *
 */
require('dotenv').config();
const generateJWT = require('./../providers/generateJWT');
const argv = require('minimist')(process.argv.slice(2));
const { User, Group } = require('./../models');
const db = require('./../providers/db');

if (!argv['userID']) throw Error('You must provide --userID argument');

(async function Main() {
    try {
        const user = await User.findByPk(argv['userID'], {
            include: [Group]
        });
        console.log(`\n\nJWT:\n\n${generateJWT(user)}\n\n`);
    } catch (err) {
        console.error(err);
    } finally {
        db.connectionManager.close();
    }
})();
