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

        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('Buckets'),
};
