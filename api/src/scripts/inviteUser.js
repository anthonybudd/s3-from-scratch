
/**
 * node ./src/scripts/inviteUser.js --email="newuser@example.com" --groupID="fdab7a99-2c38-444b-bcb3-f7cef61c275b"
 * docker exec -ti s3-api node ./src/scripts/inviteUser.js --email="newuser@example.com" --groupID="fdab7a99-2c38-444b-bcb3-f7cef61c275b"
 *
 */
require('dotenv').config();
const generateJWT = require('./../providers/generateJWT');
const argv = require('minimist')(process.argv.slice(2));
const { User, Group, GroupsUsers } = require('./../models');
const db = require('./../providers/db');
const crypto = require('crypto');

if (!argv['email']) throw Error('You must provide --email argument');
if (!argv['groupID']) throw Error('You must provide --groupID argument');

(async function Main() {
    try {
        const email = argv['email'];
        const groupID = argv['groupID'];

        let user = await User.unscoped().findOne({
            where: { email }
        });

        if (user) {
            // Check if relationship already exists
            const relationship = await GroupsUsers.findOne({
                where: {
                    groupID,
                    userID: user.id
                }
            });
            if (relationship) return console.log(`User already in this group`);
        } else {
            try {
                user = await User.create({
                    email,
                    inviteKey: crypto.randomBytes(20).toString('hex')
                });

                console.log(user);
                console.log(user.get({ plain: true }));
                console.log(user.inviteKey);

                console.log(`\n\nEMAIL THIS TO THE USER\nINVITE LINK: ${process.env.FRONTEND_URL}/invite/${user.inviteKey}\n\n`);
            } catch (error) {
                errorHandler(error);
            }
        }

        // Delete all first
        await GroupsUsers.destroy({
            where: {
                groupID,
                userID: user.id,
            }
        });

        await GroupsUsers.create({
            groupID,
            userID: user.id,
        });

        console.log(`User ${user.email} invited`);
    } catch (err) {
        console.error(err);
    } finally {
        db.connectionManager.close();
    }
})();
