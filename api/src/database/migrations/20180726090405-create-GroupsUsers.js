module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('GroupsUsers', {
        id: {  // Not used. required by msq system var sql_require_primary_key
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        groupID: {
            type: Sequelize.UUID,
        },
        userID: {
            type: Sequelize.UUID,
        },

        createdAt: {
            type: Sequelize.DATE,
            allowNull: true,
        },
    }).then(() => queryInterface.addConstraint('GroupsUsers', {
        fields: ['groupID', 'userID'],
        type: 'unique',
        name: 'groupID_userID_index'
    })),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('GroupsUsers'),
};