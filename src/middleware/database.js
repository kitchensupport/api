import db from '../../config/database.js';

let knex = require('knex')({
    client: 'pg',
    connection: {
        host: db.host,
        port: db.port,
        user: db.user,
        password: db.password,
        database: db.database,
        charset: 'utf8'
    }
});

let bs = require('bookshelf')(knex);

export default () => {
    return (req, res, next) => {
        console.log(`Connecting to database: ${db.user}:${db.password}@${db.host}:${db.port}/${db.database}`);
        next();
    };
};
