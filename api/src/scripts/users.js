
/**
 * node ./src/scripts/users.js
 * docker exec -ti s3-api node ./src/scripts/users.js
 *
 */
require('dotenv').config();
const { User } = require('./../models');
const db = require('./../providers/db');

(async function Main() {
    try {
        const users = await User.findAll();
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            console.log(`${i} - ${user.id}: ${user.email}`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        db.connectionManager.close();
    }
})();
