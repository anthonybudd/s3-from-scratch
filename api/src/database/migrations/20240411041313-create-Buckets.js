module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('Buckets', {
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
        status: {
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
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('Buckets'),
};
