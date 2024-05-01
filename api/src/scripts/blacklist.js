
/**
 * node ./src/scripts/blacklist.js --value="bad_word"
 * docker exec -ti s3-api node ./src/scripts/blacklist.js --value="bad_word"
 *
 */
require('dotenv').config();
const argv = require('minimist')(process.argv.slice(2));
const { Blacklist } = require('./../models');
const db = require('./../providers/db');

if (!argv['value']) throw Error('You must provide --value argument');

(async function Main() {
    try {
        await Blacklist.create({
            value: argv['value']
        });
        console.log(`Word added to blacklist: ${argv['value']}`);
    } catch (err) {
        console.error(err);
    } finally {
        db.connectionManager.close();
    }
})();
