
/**
 * node ./src/scripts/buckets.js
 * docker exec -ti s3-api node ./src/scripts/buckets.js
 *
 */
require('dotenv').config();
const { Bucket } = require('./../models');
const db = require('./../providers/db');

(async function Main() {
    try {
        const buckets = await Bucket.findAll();
        for (let i = 0; i < buckets.length; i++) {
            const bucket = buckets[i];
            console.log(`${i} - ${bucket.id} [${bucket.status}] ${bucket.name}.${bucket.namespace}`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        db.connectionManager.close();
    }
})();
