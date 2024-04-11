const { body, validationResult, matchedData } = require('express-validator');
const { User, Group, GroupsUsers } = require('./../models');
const errorHandler = require('./../providers/errorHandler');
const middleware = require('./middleware');
const passport = require('passport');
const express = require('express');
const crypto = require('crypto');

const app = (module.exports = express.Router());


/**
 * GET /api/v1/groups/:groupID
 *
 */
app.get('/groups/:groupID', [
    passport.authenticate('jwt', { session: false }),
    middleware.isInGroup,
], async (req, res) => {
    try {
        const group = await Group.findByPk(req.params.groupID, {
            include: (req.query.with === 'users') ? [User] : [],
        });

        return res.json(group);
    } catch (error) {
        return errorHandler(error, res);
    }
});


/**
 * POST /api/v1/groups/:groupID
 *
 */
app.post('/groups/:groupID', [
    passport.authenticate('jwt', { session: false }),
    middleware.isInGroup,
    body('name')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
        const data = matchedData(req);

        await Group.update(data, {
            where: {
                id: req.params.groupID
            }
        });

        return res.json(
            await Group.findByPk(req.params.groupID)
        );
    } catch (error) {
        return errorHandler(error, res);
    }
});


/**
 * POST /api/v1/groups/:groupID/users/invite
 *
 */
app.post('/groups/:groupID/users/invite', [
    passport.authenticate('jwt', { session: false }),
    middleware.isGroupOwner,
    body('email').isEmail().toLowerCase(),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
        const { email } = matchedData(req);

        const groupID = req.params.groupID;

        let user = await User.findOne({
            where: { email }
        });

        if (user) {
            if (user.id === req.user.id) return res.status(401).json({
                msg: 'You cannot add yourself to a group',
                code: 98644,
            });

            // Check if relationship already exists
            const relationship = await GroupsUsers.findOne({
                where: {
                    groupID,
                    userID: user.id
                }
            });
            if (relationship) return res.json({
                groupID,
                userID: user.id
            });
        } else {
            try {
                user = await User.create({
                    email,
                    inviteKey: crypto.randomBytes(20).toString('hex'),
                    emailVerificationKey: crypto.randomBytes(20).toString('hex'),
                });

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

        return res.json({
            groupID,
            userID: user.id,
        });
    } catch (error) {
        return errorHandler(error, res);
    }
});


/**
 * DELETE /api/v1/groups/:groupID/users/:userID
 *
 */
app.delete('/groups/:groupID/users/:userID', [
    passport.authenticate('jwt', { session: false }),
    middleware.isGroupOwner,
    middleware.isNotSelf,
], async (req, res) => {

    await GroupsUsers.destroy({
        where: {
            groupID: req.params.groupID,
            userID: req.params.userID,
        }
    });

    return res.json({
        userID: req.params.userID,
        groupID: req.params.groupID
    });
});
