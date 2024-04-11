const { body, validationResult, matchedData } = require('express-validator');
const { User, Group, GroupsUsers } = require('./../models');
const errorHandler = require('./../providers/errorHandler');
const generateJWT = require('./../providers/generateJWT');
const bcrypt = require('bcrypt-nodejs');
const passport = require('passport');
const express = require('express');
const uuidv4 = require('uuid/v4');
const moment = require('moment');
const crypto = require('crypto');

const app = (module.exports = express.Router());


/**
 * GET /api/v1/_authcheck
 * 
 * Helper route for testing auth status
 */
app.get('/_authcheck', [
    passport.authenticate('jwt', { session: false })
], (req, res) => res.json({
    auth: true,
    id: req.user.id,
}));


/**
 * POST api/v1/auth/login
 * 
 */
app.post('/auth/login', [
    body('email').exists().toLowerCase(),
    body('password').exists(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });

    passport.authenticate('local', { session: false }, (err, user) => {
        if (err) return errorHandler(err, res);
        if (!user) return res.status(401).json('Incorrect email or password');

        req.login(user, { session: false }, (err) => {
            if (err) return errorHandler(err, res);

            res.json({
                accessToken: generateJWT(user)
            });

            User.update({
                lastLoginAt: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            }, {
                where: {
                    id: user.id
                }
            });
        });
    })(req, res);
});


/**
 * POST /api/v1/auth/sign-up
 * 
 */
app.post('/auth/sign-up', [
    body('email', 'This email address is taken')
        .isEmail()
        .trim()
        .toLowerCase()
        .custom(async (email) => {
            const user = await User.findOne({ where: { email } });
            if (user) throw new Error('This email address is taken');
        }),
    body('password', 'Your password must be atleast 7 characters long')
        .isLength({ min: 7 }),
    body('firstName', 'You must provide your first name')
        .notEmpty()
        .exists(),
    body('lastName')
        .optional(),
    body('groupName')
        .optional(),
    body('tos', 'You must accept the Terms of Service to use this platform')
        .exists()
        .notEmpty(),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
        const data = matchedData(req);

        const userID = uuidv4();
        const groupID = uuidv4();
        const ucFirst = (string) => string.charAt(0).toUpperCase() + string.slice(1);
        if (!data.lastName) data.lastName = '';
        if (!data.groupName) data.groupName = data.firstName.concat("'s Team");

        await Group.create({
            id: groupID,
            name: data.groupName,
            ownerID: userID,
        });

        await GroupsUsers.create({ userID, groupID });

        const user = await User.create({
            id: userID,
            email: data.email,
            password: bcrypt.hashSync(data.password, bcrypt.genSaltSync(10)),
            firstName: ucFirst(data.firstName),
            lastName: ucFirst(data.lastName),
            lastLoginAt: moment().format("YYYY-MM-DD HH:mm:ss"),
            tos: data.tos,
            emailVerificationKey: crypto.randomBytes(20).toString('hex'),
        });

        console.log(`\n\nEMAIL THIS TO THE USER\nEMAIL VERIFICATION LINK: ${process.env.FRONTEND_URL}/validate-email/${user.emailVerificationKey}\n\n`);

        return passport.authenticate('local', { session: false }, (err, user) => {
            if (err) return errorHandler(err, res);
            req.login(user, { session: false }, (err) => {
                if (err) return errorHandler(err, res);
                res.json({
                    accessToken: generateJWT(user)
                });
            });
        })(req, res);
    } catch (error) {
        return errorHandler(error, res);
    }
});


/**
 * GET /api/v1/auth/verify-email/:emailVerificationKey
 * 
 * Verify Email
 */
app.get('/auth/verify-email', [

], async (req, res) => {

    const user = await User.findOne({
        where: {
            emailVerificationKey: req.params.emailVerificationKey
        }
    });

    if (!user) return res.status(404).json({
        msg: 'User not found',
        code: 40402
    });

    await user.update({
        emailVerified: true,
        emailVerificationKey: null,
    });

    return res.json({ success: true });
});


/**
 * POST /api/v1/auth/forgot
 * 
 * Forgot Password
 */
app.post('/auth/forgot', [
    body('email', 'You must provide a valid email address')
        .isEmail()
        .toLowerCase()
        .custom(async (email) => {
            const user = await User.findOne({ where: { email } });
            if (!user) throw new Error('This email address does not exist');
        }),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
    const { email } = matchedData(req);

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({
        msg: 'User not found',
        code: 40401
    });

    const passwordResetKey = crypto.randomBytes(32).toString('base64').replace(/[^a-zA-Z0-9]/g, '');

    await user.update({ passwordResetKey });

    console.log(`\n\nEMAIL THIS TO THE USER\nPASSWORD RESET LINK: ${process.env.FRONTEND_URL}/reset/${passwordResetKey}\n\n`);

    return res.json({ success: true });
});


/**
 * GET /api/v1/auth/get-user-by-reset-key/:passwordResetKey
 * 
 * Get users email
 */
app.get('/auth/get-user-by-reset-key/:passwordResetKey', async (req, res) => {
    const user = await User.findOne({
        where: {
            passwordResetKey: req.params.passwordResetKey
        },
    });
    if (!user) return res.status(404).send('Not found');

    return res.json({
        id: user.id,
        email: user.email
    });
});


/**
 * POST /api/v1/auth/reset
 * 
 * Update User's Password
 */
app.post('/auth/reset', [
    body('email', 'You must provide a valid email address')
        .isEmail()
        .toLowerCase()
        .custom(async (email) => {
            const user = await User.findOne({ where: { email } });
            if (!user) throw new Error('This email address does not exist');
        }),
    body('password').exists().isLength({ min: 7 }),
    body('passwordResetKey', 'This link has expired')
        .custom(async (passwordResetKey) => {
            if (!passwordResetKey) throw new Error('This link has expired');
            const user = await User.findOne({ where: { passwordResetKey } });
            if (!user) throw new Error('This link has expired');
        }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
    const { email, password, passwordResetKey } = matchedData(req);

    const user = await User.findOne({
        where: { email, passwordResetKey },
        include: [Group],
    });
    if (!user) return res.status(404).send('Not found');

    await user.update({
        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
        passwordResetKey: null,
    });

    return passport.authenticate('local', { session: false }, (err, user) => {
        if (err) return errorHandler(err, res);
        req.login(user, { session: false }, (err) => {
            if (err) return errorHandler(err, res);
            return res.json({ accessToken: generateJWT(user) });
        });
    })(req, res);
});


/**
 * GET /api/v1/auth/get-user-by-invite-key/:inviteKey
 * 
 * Get users email
 */
app.get('/auth/get-user-by-invite-key/:inviteKey', async (req, res) => {
    const user = await User.findOne({
        where: {
            inviteKey: req.params.inviteKey
        },
    });
    if (!user) return res.status(404).send('Not found');

    return res.json({
        id: user.id,
        email: user.email
    });
});


/**
 * POST /api/v1/auth/invite
 * 
 */
app.post('/auth/invite', [
    body('email', 'You must provide your email address')
        .exists({ checkFalsy: true })
        .isEmail()
        .toLowerCase(),
    body('password', 'Your password must be atleast 7 characters long')
        .isLength({ min: 7 }),
    body('firstName', 'You must provide your first name')
        .exists(),
    body('lastName'),
    body('tos', 'You must accept the Terms of Service to use this platform')
        .exists(),
    body('inviteKey').exists(),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
        const data = matchedData(req);

        const ucFirst = (string) => string.charAt(0).toUpperCase() + string.slice(1);
        const user = await User.findOne({ where: { inviteKey: data.inviteKey } });
        if (!user) return res.status(404).send('Not found');
        await user.update({
            password: bcrypt.hashSync(data.password, bcrypt.genSaltSync(10)),
            firstName: ucFirst(data.firstName),
            lastName: ucFirst(data.lastName),
            lastLoginAt: moment().format('YYYY-MM-DD HH:mm:ss'),
            tos: data.tos,
            inviteKey: null,
            emailVerified: true,
            emailVerificationKey: null,
        });

        return passport.authenticate('local', { session: false }, (err, user) => {
            if (err) return errorHandler(err, res);
            req.login(user, { session: false }, (err) => {
                if (err) return errorHandler(err, res);
                return res.json({ accessToken: generateJWT(user) });
            });
        })(req, res);
    } catch (error) {
        return errorHandler(error, res);
    }
});
