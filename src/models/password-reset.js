import bookshelf from '../utils/database';
import knex from 'knex';
import model from '../utils/model';
import {Model as User} from './user';

model('reset_password', (schema) => {
    schema.increments('id').primary();
    schema.integer('user_id');
    schema.string('reset_token').unique();
    schema.dateTime('expire_date').defaultTo(knex.raw('now() + INTERVAL \'30 minutes\''));
});

export default bookshelf.Model.extend({
    tableName: 'reset_password',

    user() {
        return this.belongsTo(User);
    }
});
