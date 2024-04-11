const { body, validationResult, matchedData } = require('express-validator');
const errorHandler = require('./../providers/errorHandler');
const { User, Group } = require('./../models');
const middleware = require('./middleware');
const bcrypt = require('bcrypt-nodejs');
const passport = require('passport');
const express = require('express');

const app = (module.exports = express.Router());


/**
 * GET /api/v1/user
 * 
 */
app.get('/user', [
    passport.authenticate('jwt', { session: false })
], async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [Group],
        });

        if (!user) return res.status(404).send('User not found');

        return res.json(user);
    } catch (error) {
        errorHandler(error, res);
    }
});


/**
 * POST /api/v1/user
 * 
 */
app.post('/user', [
    passport.authenticate('jwt', { session: false }),
    body('firstName').exists(),
    body('lastName').exists(),
    body('bio').exists(),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
        const data = matchedData(req);

        await User.update(data, { where: { id: req.user.id } });

        return res.json(
            await User.findByPk(req.user.id)
        );
    } catch (error) {
        return errorHandler(error, res);
    }
});


/**
 * POST /api/v1/user/update-password
 * 
 * Update Password
 */
app.post('/user/update-password', [
    passport.authenticate('jwt', { session: false }),
    middleware.checkPassword,
    body('password').exists(),
    body('newPassword').exists(),
    body('newPassword', 'Your password must be atleast 7 characters long').isLength({ min: 7 }),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
        const data = matchedData(req);

        await User.unscoped().update({
            password: bcrypt.hashSync(data.newPassword, bcrypt.genSaltSync(10)),
        }, {
            where: {
                id: req.user.id,
            }
        });

        return res.json({ success: true });
    } catch (error) {
        return errorHandler(error, res);
    }
});
