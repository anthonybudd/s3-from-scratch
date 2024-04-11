
/**
 * node ./src/scripts/generate.js --modelName="bucket"
 * docker exec -ti s3-api node ./src/scripts/generate.js --modelName="bucket"

 */
require('dotenv').config();
const argv = require('minimist')(process.argv.slice(2));
const { v4: uuidv4 } = require('uuid');
const Mustache = require('mustache');
const moment = require('moment');
const path = require('path');
const fs = require('fs');

if (!argv['modelName']) throw Error('You must provide --modelName argument');

(async function Main() {
    const ucFirst = (string) => (string.charAt(0).toUpperCase().concat(string.slice(1)));

    const params = {
        modelname: argv['modelName'].toLowerCase(),
        modelName: argv['modelName'],
        ModelName: ucFirst(argv['modelName']),

        modelnames: argv['modelName'].toLowerCase().concat('s'),
        modelNames: argv['modelName'].concat('s'),
        ModelNames: ucFirst(argv['modelName']).concat('s'),
        UUID: uuidv4(),
    };

    if (argv['v']) console.log(params);

    const pathModel = path.resolve(`./src/models/${params.ModelName}.js`);
    fs.writeFileSync(pathModel, Mustache.render(fs.readFileSync(path.resolve('./src/scripts/generator/Model.js'), 'utf8'), params));
    console.log(`Created: ${pathModel}`);

    const pathRoute = path.resolve(`./src/routes/${params.ModelNames}.js`);
    fs.writeFileSync(pathRoute, Mustache.render(fs.readFileSync(path.resolve('./src/scripts/generator/Route.js'), 'utf8'), params));
    console.log(`Created: ${pathRoute}`);

    const pathMigration = path.resolve(`./src/database/migrations/${moment().format('YYYYMMDDHHmmss')}-create-${params.ModelNames}.js`);
    fs.writeFileSync(pathMigration, Mustache.render(fs.readFileSync(path.resolve('./src/scripts/generator/Migration.js'), 'utf8'), params));
    console.log(`Created: ${pathMigration}`);

    const pathSeeder = path.resolve(`./src/database/seeders/${moment().format('YYYYMMDDHHmmss')}-${params.ModelNames}.js`);
    fs.writeFileSync(pathSeeder, Mustache.render(fs.readFileSync(path.resolve('./src/scripts/generator/Seeder.js'), 'utf8'), params));
    console.log(`Created: ${pathSeeder}`);
})();


