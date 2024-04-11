const bcrypt = require('bcrypt-nodejs');
const moment = require('moment');
const faker = require('faker');

const insert = [{
    id: 'c4644733-deea-47d8-b35a-86f30ff9618e',
    email: 'user@example.com',
    password: bcrypt.hashSync('Password@1234', bcrypt.genSaltSync(10)),
    firstName: 'User',
    lastName: 'One',
    tos: 'tos-version-2023-07-13',
    createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
}, {
    id: 'd700932c-4a11-427f-9183-d6c4b69368f9',
    email: 'other.user@foobar.com',
    password: bcrypt.hashSync('Password@1234', bcrypt.genSaltSync(10)),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    tos: 'tos-version-2023-07-13',
    inviteKey: '86f30ff9618e',
    createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
}];


module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Users', insert).catch(err => console.log(err)),
    down: (queryInterface, Sequelize) => { }
};
