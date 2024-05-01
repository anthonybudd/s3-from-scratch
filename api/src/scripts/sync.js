/**
 * node ./src/scripts/sync.js
 * docker exec -ti s3-api node ./src/scripts/sync.js
 *
 */

require('dotenv').config();
const argv = require('minimist')(process.argv.slice(2));
const { Bucket } = require('./../models');
const db = require('./../providers/db');

(async function Main() {
    try {
        const buckets = await Bucket.findAll();
        for (const bucket of buckets) {
            await bucket.sync();
        }
    } catch (err) {
        console.error(err);
    }
})();
