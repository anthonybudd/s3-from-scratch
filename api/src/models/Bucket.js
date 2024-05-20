const { exec } = require('child_process');
const db = require('./../providers/db');
const Sequelize = require('sequelize');
const tmp = require('tmp');
const fs = require('fs');

const Bucket = db.define('Bucket', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true
    },

    createdAt: {
        type: Sequelize.DATE,
        allowNull: true,
    },
    updatedAt: {
        type: Sequelize.DATE,
        allowNull: true,
    },
    deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
    },

    userID: {
        type: Sequelize.UUID,
        allowNull: true,
    },

    namespace: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },

    status: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    bucketCreated: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    endpoint: {
        type: Sequelize.STRING,
        allowNull: false,
    },

    stdout: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    stderr: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'Buckets',
    paranoid: true,
    defaultScope: {
        attributes: {
            exclude: []
        }
    },
});

Bucket.prototype.createK3sAssets = async function () {
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

    tmp.file((err, path) => {
        if (err) throw err;
        fs.readFile('/app/src/providers/bucket.yml', 'utf8', (err, data) => {
            if (err) throw err;

            const result = data.replace(/NAMESPACE_HERE/g, this.namespace)
                .replace(/BUCKETNAME_HERE/g, this.name)
                .replace(/ROOTUSER/g, accessKeyID)
                .replace(/ROOTPASSWORD/g, secretAccessKey);

            fs.writeFile(path, result, 'utf8', (err) => {
                if (err) throw err;

                exec(`kubectl --kubeconfig=${process.env.K8S_CONFIG_PATH} apply -f ${path}`, (err, stdout, stderr) => {
                    if (err) console.error(err);

                    console.log(`stdout: ${stdout}`);
                    console.log(`stderr: ${stderr}`);

                    let status = 'Provisioning';
                    if (stderr) status = 'Error';

                    this.update({
                        status,
                        stdout,
                        stderr,
                    });
                });
            });
        });
    });

    return {
        accessKeyID,
        secretAccessKey
    };
};

Bucket.prototype.createBucket = async function () {
    const command = `kubectl --kubeconfig=${process.env.K8S_CONFIG_PATH} -n ${this.namespace} exec minio-pod -- ./s3-create-bucket-script/create-bucket.sh`;
    console.log(command);
    exec(command, (err, stdout, stderr) => {
        if (err) console.error(err);

        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);

        if (stderr) {
            this.update({
                status: 'Error',
                createStderr: `2: ${stderr}`,
            });
        } else {
            this.update({ bucketCreated: true });
        }
    });
};

Bucket.prototype.sync = async function () {
    if (this.status !== 'Error') {
        exec(`kubectl --kubeconfig=${process.env.K8S_CONFIG_PATH} -n ${this.namespace} get pod minio-pod --no-headers -o custom-columns=":status.phase"`, (err, stdout, stderr) => {
            if (err) console.error(err);

            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);

            switch (stdout.trim()) {
                case 'Running':
                    if (this.status !== 'Provisioned') this.update({ status: 'Provisioned' });
                    if (!this.bucketCreated) this.createBucket();
                    break;
            }
        });
    }
};

Bucket.prototype.deleteK3sAssets = async function () {
    exec(`kubectl --kubeconfig=${process.env.K8S_CONFIG_PATH} -n ${this.namespace} delete pod/minio-pod service/minio-svc ingress/minio-ing persistentvolumeclaim/minio-pvc namespace/${this.namespace}`, (err, stdout, stderr) => {
        if (err) console.error(err);
        if (stderr) console.log(`stderr: ${stderr}`);
        console.log(`stdout: ${stdout}`);

        this.update({
            stdout,
            stderr,
        });
    });
};

module.exports = Bucket;