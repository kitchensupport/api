import knex from 'knex';
import bs from 'bookshelf';
import db from '../../config/database.js';

export let bookshelf;

export function instantiateDatabase() {
    console.log(`Connecting to database: ${db.user}:${db.password}@${db.host}:${db.port}/${db.database}`);
    bookshelf = bs(
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
    return bookshelf;
};

export default function getDatabase() {
    if (bookshelf) {
        return bookshelf;
    } else {
        return instantiateDatabase();
    }
};
