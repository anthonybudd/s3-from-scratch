const Sequelize = require('sequelize');
const db = require('./../providers/db');

module.exports = db.define('User', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true
    },

    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: Sequelize.STRING,

    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    bio: Sequelize.TEXT,

    tos: Sequelize.STRING,
    inviteKey: Sequelize.STRING,
    passwordResetKey: Sequelize.STRING,
    emailVerificationKey: Sequelize.STRING,
    emailVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },

    lastLoginAt: {
        type: Sequelize.DATE,
        allowNull: true,
    },
}, {
    tableName: 'Users',
    defaultScope: {
        attributes: {
            exclude: [
                'password',
                'passwordResetKey',
            ]
        }
    },
});
