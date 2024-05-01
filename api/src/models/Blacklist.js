const Sequelize = require('sequelize');
const db = require('./../providers/db');

const Blacklist = db.define('Blacklist', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true
    },

    value: {
        type: Sequelize.STRING,
        allowNull: false,
    },

    createdAt: {
        type: Sequelize.DATE,
        allowNull: true,
    },
    updatedAt: {
        type: Sequelize.DATE,
        allowNull: true,
    },

}, {
    tableName: 'Blacklist',
    defaultScope: {
        attributes: {
            exclude: [

            ]
        }
    },
});

module.exports = Blacklist;