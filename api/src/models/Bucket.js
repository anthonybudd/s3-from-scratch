const Sequelize = require('sequelize');
const db = require('./../providers/db');

module.exports = db.define('Bucket', {
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
