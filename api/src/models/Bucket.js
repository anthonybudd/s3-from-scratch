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

    name: {
        type: Sequelize.STRING,
        allowNull: false,
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
