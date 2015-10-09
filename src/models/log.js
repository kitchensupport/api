import bookshelf from '../utils/database';

bookshelf.knex.schema.hasTable('logs').then((exists) => {
    if (!exists) {
        console.log(`Creating 'logs' table.`);
        bookshelf.knex.schema.createTable('logs', (log) => {
            log.increments('id').primary();
            log.string('ip');
            log.string('method');
            log.string('requested');
            log.dateTime('date').defaultTo(bookshelf.knex.raw('now()'));
        }).then(() => {
            console.log(`'logs' table created successfully.`);
        });
    }
});

export default bookshelf.Model.extend({
    tableName: 'logs'
});
