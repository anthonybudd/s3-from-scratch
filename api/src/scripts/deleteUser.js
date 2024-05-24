
/**
 * node ./src/scripts/deleteUser.js --userID="fdab7a99-2c38-444b-bcb3-f7cef61c275b"
 * docker exec -ti s3-api node ./src/scripts/deleteUser.js --userID="fdab7a99-2c38-444b-bcb3-f7cef61c275b"
 *
 */
require('dotenv').config();
const argv = require('minimist')(process.argv.slice(2));
const { User } = require('./../models');
const db = require('./../providers/db');

if (!argv['userID']) throw Error('You must provide --userID argument');

(async function Main() {
    try {
        await User.destroy({
            where: {
                id: argv['userID'],
            }
        });

        console.log(`User ${argv['userID']} deleted`);
    } catch (err) {
        console.error(err);
    } finally {
        db.connectionManager.close();
    }
})();
