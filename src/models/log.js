import bookshelf from '../utils/database';
import model from '../utils/model';

model('logs', (schema) => {
    schema.increments('id').primary();
    schema.string('ip');
    schema.string('method');
    schema.string('requested');
    schema.dateTime('date').defaultTo(bookshelf.knex.raw('now()'));
});

export default bookshelf.Model.extend({
    tableName: 'logs'
});
