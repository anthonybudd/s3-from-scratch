const { body, validationResult, matchedData } = require('express-validator');
const errorHandler = require('./../providers/errorHandler');
const { Bucket, Blacklist } = require('./../models');
const middleware = require('./middleware');
const passport = require('passport');
const express = require('express');


const app = (module.exports = express.Router());


/**
 * GET /api/v1/buckets
 * 
 */
app.get('/buckets', [
    passport.authenticate('jwt', { session: false })
], async (req, res) => {
    try {
        return res.json(await Bucket.findAll({
            where: {
                userID: req.user.id,
            }
        }));
    } catch (error) {
        errorHandler(error, res);
    }
});


/**
 * POST /api/v1/buckets
 * 
 * Create Bucket
 */
app.post('/buckets', [
    passport.authenticate('jwt', { session: false }),
    body('namespace')
        .exists()
        .notEmpty()
        .matches(/^[a-z0-9-_]+$/),

    body('namespace')
        .custom(async (value) => {
            const blacklist = await Blacklist.findOne({ where: { value } });
            if (blacklist) throw new Error('This namespace is not allowed');
        })
        .custom(async (namespace, { req }) => {
            const exists = await Bucket.findOne({
                where: {
                    namespace: req.body.namespace
                }
            });

            if (exists) throw new Error('Namespace already exists.');
        }),

    body('name')
        .exists()
        .notEmpty()
        .matches(/^[a-z0-9-_]+$/),
    body('name')
        .custom(async (value) => {
            const blacklist = await Blacklist.findOne({ where: { value } });
            if (blacklist) throw new Error('This bucket name is not allowed');
        })
        .custom(async (name, { req }) => {
            const exists = await Bucket.findOne({
                where: {
                    name: req.body.name
                }
            });

            if (exists) throw new Error('Bucket already exists.');
        }),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
        const data = matchedData(req);

        const bucket = await Bucket.create({
            userID: req.user.id,
            namespace: data.namespace,
            name: data.name,
            status: 'Provisioning',
            endpoint: `${data.name}.${data.namespace}.${process.env.S3_ROOT}`,
        });

        const { accessKeyID, secretAccessKey } = await bucket.createK3sAssets();

        return res.json({
            ...bucket.get({ plain: true }),
            accessKeyID,
            secretAccessKey,
        });
    } catch (error) {
        return errorHandler(error, res);
    }
});


/**
 * DELETE /api/v1/buckets/:bucketID
 * 
 * Delete Bucket
 */
app.delete('/buckets/:bucketID', [
    passport.authenticate('jwt', { session: false }),
    middleware.canAccessBucket,
], async (req, res) => {
    try {
        const bucket = await Bucket.findByPk(req.params.bucketID);
        bucket.deleteK3sAssets();
        await bucket.destroy();
        return res.json({ id: req.params.bucketID });
    } catch (error) {
        return errorHandler(error, res);
    }
});
