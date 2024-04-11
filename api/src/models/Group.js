const Sequelize = require('sequelize');
const db = require('./../providers/db');

module.exports = db.define('Group', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true
    },

    name: Sequelize.STRING,
    ownerID: Sequelize.UUID,

    deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
    },
}, {
    tableName: 'Groups',
    paranoid: true,
});
