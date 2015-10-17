import knex from 'knex';
import bs from 'bookshelf';
import db from '../../config/database.js';

const bookshelf = bs(knex({
    client: 'pg',
    connection: db.connectionString
}));

export default bookshelf;
