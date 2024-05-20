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
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('Buckets'),
};
