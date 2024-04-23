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
        const buckets = await Bucket.findAll({
            where: {
                userID: req.user.id,
            }
        });

        return res.json(buckets);
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

        const generateAccessKeyID = () => {
            const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz23456789';
            const length = 16;
            let randomString = '';
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * charSet.length);
                randomString += charSet.charAt(randomIndex);
            }
            return randomString;
        };

        const generateSecretAccessKey = () => {
            const length = 40;
            const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/';
            let randomString = '';
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * charset.length);
                randomString += charset.charAt(randomIndex);
            }
            return randomString;
        };

        const accessKeyID = generateAccessKeyID();
        const secretAccessKey = generateSecretAccessKey();

        const bucket = await Bucket.create({
            userID: req.user.id,
            name: data.name,
            status: 'Provisioning',
            endpoint: `${data.name}.${process.env.S3_ROOT}`,
        });

        tmp.file((err, path) => {
            if (err) throw err;
            fs.readFile('/app/bucket.yml', 'utf8', (err, data) => {
                if (err) throw err;

                const result = data.replace(/NAMESPACE/g, bucket.name)
                    .replace(/ROOTUSER/g, accessKeyID)
                    .replace(/ROOTPASSWORD/g, secretAccessKey);

                fs.writeFile(path, result, 'utf8', (err) => {
                    if (err) throw err;

                    exec(`kubectl --kubeconfig=/app/config apply -f ${path}`, (err, stdout, stderr) => {
                        if (err) console.error(err);

                        console.log(`stdout: ${stdout}`);
                        console.log(`stderr: ${stderr}`);

                        bucket.update({
                            createStdout: stdout,
                            createStderr: stderr,
                        });
                    });
                });
            });
        });

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

        exec(`kubectl --kubeconfig=/app/config -n ${bucket.name} delete pod/minio-pod service/minio-svc ingress/minio-ing persistentvolumeclaim/minio-pvc`, (err, stdout, stderr) => {
            if (err) console.error(err);

            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);

            bucket.update({
                deleteStdout: stdout,
                deleteStderr: stderr,
            });
        });

        await bucket.destroy();

        return res.json({ id: bucketID });
    } catch (error) {
        return errorHandler(error, res);
    }
});
