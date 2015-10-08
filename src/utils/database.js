import knex from 'knex';
import bs from 'bookshelf';
import db from '../../config/database.js';

const bookshelf = bs(
            knex({
                client: 'pg',
                connection: {
                    host: db.host,
                    port: db.port,
                    user: db.user,
                    password: db.password,
                    database: db.database,
                    charset: 'utf8',
                    ssl: true
                }
            })
        );

export default bookshelf;
