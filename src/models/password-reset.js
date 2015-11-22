import bookshelf from '../utils/database';
import makeTable from '../utils/make-table';

const Model = bookshelf.Model.extend({
    tableName: 'reset_password',

    user() {
        return this.belongsTo(bookshelf.model('User'));
    }
});

export default function initialize() {
    makeTable('reset_password', (schema) => {
        schema.increments('id').primary();
        schema.integer('user_id');
        schema.string('reset_token').unique();
        schema.dateTime('expire_date').defaultTo(bookshelf.knex.raw('now() + INTERVAL \'30 minutes\''));
    });

    bookshelf.model('PasswordReset', Model);
};
