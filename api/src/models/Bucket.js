const Sequelize = require('sequelize');
const db = require('./../providers/db');
const { exec } = require('child_process');

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

    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    status: { // Provisioning, ProvisioningFailed, Provisioned, Deprovisioning, Deprovisioned
        type: Sequelize.STRING,
        allowNull: false,
    },
    endpoint: {
        type: Sequelize.STRING,
        allowNull: false,
    },

    createStdout: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    createStderr: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    deleteStdout: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    deleteStderr: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'Buckets',
    paranoid: true,
    defaultScope: {
        attributes: {
            exclude: [

            ]
        }
    },
});

Bucket.prototype.sync = async function () {
    exec(`kubectl --kubeconfig=${process.env.K8S_CONFIG_PATH} -n ${this.name} get pvc --no-headers -o custom-columns=":status.phase" `, (err, stdout, stderr) => {
        if (err) console.error(err);

        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);

        switch (stdout.trim()) {
            case 'Pending':
                this.update({ status: 'Provisioning' });
                break;
            case 'Bound':
                this.update({ status: 'Provisioned' });
                break;
        }
    });
};

module.exports = Bucket;