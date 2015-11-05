import knex from 'knex';
import bs from 'bookshelf';
import dbConfig from '../../config/database.js';

export default bs(knex({
    client: 'pg',
    connection: dbConfig.connectionString
}));
