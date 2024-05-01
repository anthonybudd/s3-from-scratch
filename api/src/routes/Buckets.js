const { body, validationResult, matchedData } = require('express-validator');
const errorHandler = require('./../providers/errorHandler');
const { Bucket, Blacklist } = require('./../models');
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
    body('name')
        .notEmpty()
        .toLowerCase()
        .custom(async (value) => {
            const blacklist = await Blacklist.findOne({ where: { value } });
            if (blacklist) throw new Error('This bucket name is not allowed');
        })
        .custom(async (name) => {
            const exists = await Bucket.findOne({ where: { name } });
            if (exists) throw new Error('Bucket already exists.');
        }),
    body('name').exists().customSanitizer(string => string.toString().trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-").replace(/^-+/, "").replace(/-+$/, "")),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
        const data = matchedData(req);

        const generateAccessKeyID = () => {
            const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz23456789';
            const length = 20;
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

                    exec(`kubectl --kubeconfig=${process.env.K8S_CONFIG_PATH} apply -f ${path}`, (err, stdout, stderr) => {
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

        exec(`kubectl --kubeconfig=${process.env.K8S_CONFIG_PATH} -n ${bucket.name} delete pod/minio-pod service/minio-svc ingress/minio-ing persistentvolumeclaim/minio-pvc`, (err, stdout, stderr) => {
            if (err) console.error(err);

            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);

            bucket.update({
                deleteStdout: stdout,
                deleteStderr: stderr,
            });
        });

        await bucket.destroy();

        return res.json({ id: req.params.bucketID });
    } catch (error) {
        return errorHandler(error, res);
    }
});
