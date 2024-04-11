const moment = require('moment');

const insert = [{
    id: '{{ UUID }}',
    createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
}];

module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.bulkInsert('{{ ModelNames }}', insert).catch(err => console.log(err)),
    down: (queryInterface, Sequelize) => { }
};
