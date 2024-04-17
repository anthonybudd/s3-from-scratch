const moment = require('moment');

const insert = [{
    id: 'fae8a1fb-bc90-4565-b567-1fe6846544de',
    createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    userID: 'c4644733-deea-47d8-b35a-86f30ff9618e',
    name: 'test-bucket',
}];

module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Buckets', insert).catch(err => console.log(err)),
    down: (queryInterface, Sequelize) => { }
};
