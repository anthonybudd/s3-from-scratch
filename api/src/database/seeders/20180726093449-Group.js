const moment = require('moment');

const insert = [{
    id: 'fdab7a99-2c38-444b-bcb3-f7cef61c275b',
    ownerID: 'c4644733-deea-47d8-b35a-86f30ff9618e',
    name: 'Group A',
    createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
}, {
    id: 'be1fcb4e-caf9-41c2-ac27-c06fa24da36a',
    ownerID: 'd700932c-4a11-427f-9183-d6c4b69368f9',
    name: 'Group B',
    createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
}];


module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Groups', insert).catch(err => console.log(err)),
    down: (queryInterface, Sequelize) => { }
};
