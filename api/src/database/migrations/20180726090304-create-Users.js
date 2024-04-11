module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('Users', {
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
        createdAt: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        updatedAt: {
            type: Sequelize.DATE,
            allowNull: true,
        },
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('Users'),
};
