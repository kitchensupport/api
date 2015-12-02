import knex from 'knex';
import bs from 'bookshelf';
import dbConfig from '../../config/database.js';

const bookshelf = bs(knex({
    client: 'pg',
    connection: dbConfig.connectionString
}));

bookshelf.plugin('registry');

export default bookshelf;
