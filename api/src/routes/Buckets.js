const { body, validationResult, matchedData } = require('express-validator');
const errorHandler = require('./../providers/errorHandler');
const { Bucket, Group } = require('./../models');
const middleware = require('./middleware');
const { exec } = require('child_process');
const bcrypt = require('bcrypt-nodejs');
const passport = require('passport');
const express = require('express');
const tmp = require('tmp');
const fs = require('fs');


const app = (module.exports = express.Router());


/**
 * GET /api/v1/buckets
 * 
 */
app.get('/buckets', [
    passport.authenticate('jwt', { session: false })
], async (req, res) => {
    try {
        const buckets = await Bucket.findAll();

        return res.json(buckets);
    } catch (error) {
        errorHandler(error, res);
    }
});


/**
 * GET /api/v1/buckets/:bucketID
 * 
 */
app.get('/buckets/:bucketID', [
    passport.authenticate('jwt', { session: false }),
], async (req, res) => {
    try {
        const bucket = await Bucket.findByPk(req.params.bucketID);
        if (!bucket) return res.status(404).json({
            msg: `Bucket does not exists.`,
            code: 97924,
        });

        return res.json(bucket);
    } catch (error) {
        return errorHandler(error, res);
    }
});


/**
 * POST /api/v1/buckets
 * 
 * Create Bucket
 */
app.post('/buckets', [
    passport.authenticate('jwt', { session: false }),
    body('name').exists().customSanitizer(string => string.toString().trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-").replace(/^-+/, "").replace(/-+$/, "")),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
        const data = matchedData(req);

        const exists = await Bucket.findOne({ where: { name: data.name } });
        if (exists) return res.status(422).json({
            msg: `Bucket already exists.`,
            code: 97924,
        });

        const bucket = await Bucket.create({
            name: data.name,
        });

        tmp.file((err, path) => {
            if (err) throw err;
            fs.readFile('/app/bucket.yml', 'utf8', (err, data) => {
                if (err) throw err;

                const result = data.replace(/NAMESPACE/g, bucket.name);
                fs.writeFile(path, result, 'utf8', (err) => {
                    if (err) throw err;

                    exec(`kubectl --kubeconfig=/app/config apply -f ${path}`, (err, stdout, stderr) => {
                        if (err) console.error(err);

                        console.log(`stdout: ${stdout}`);
                        console.log(`stderr: ${stderr}`);
                    });
                });
            });
        });

        return res.json(bucket);
    } catch (error) {
        return errorHandler(error, res);
    }
});


/**
 * POST /api/v1/buckets/:bucketID
 * 
 * Update Bucket
 */
app.post('/buckets/:bucketID', [
    passport.authenticate('jwt', { session: false }),
    // body('field').exists(),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
        const data = matchedData(req);

        await Bucket.update(data, {
            where: {
                id: req.params.bucketID,
            }
        });

        return res.json({ success: true });
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
], async (req, res) => {
    try {
        const bucket = await Bucket.findByPk(req.params.bucketID);
        if (!bucket) return res.status(404).json({
            msg: `Bucket does not exists.`,
            code: 97924,
        });

        // exec(`kubectl --kubeconfig=/app/config -n ${bucket.name} delete pod/${bucket.name}-pod service/${bucket.name}-svc ingress/${bucket.name}-ing persistentvolumeclaim/${bucket.name}-pvc`, (err, stdout, stderr) => {
        exec(`kubectl --kubeconfig=/app/config -n ${bucket.name} delete pod/minio-pod service/minio-svc ingress/minio-ing persistentvolumeclaim/minio-pvc`, (err, stdout, stderr) => {
            if (err) console.error(err);

            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
        });

        await bucket.destroy();

        return res.json({ success: true });
    } catch (error) {
        return errorHandler(error, res);
    }
});
