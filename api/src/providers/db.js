const Sequelize = require('sequelize');
const connections = require('./connections');
const errorHandler = require('./errorHandler');


const connection = (typeof global.it === 'function') ? 'test' : (process.env.NODE_ENV || 'development');
const dbHost = connections[connection].host;
const dbPort = connections[connection].port;
const dbName = connections[connection].database;
const dbUser = connections[connection].username;
const dbPassword = connections[connection].password;
const dbDialect = connections[connection].dialect;


const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    port: dbPort,
    host: dbHost,
    dialect: dbDialect,
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});

sequelize.authenticate()
    .then(() => ((typeof global.it !== 'function') ? console.log('* Sequelize: Connected') : ''))
    .catch(err => errorHandler(err));

module.exports = sequelize;
