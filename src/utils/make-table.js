import bookshelf from './database';

/**
 * If the table doesn't exist, we create the table based on the model schema provided.
 * @param  {String} table          The name of the table in the database.
 * @param  {Function} schemaCallback Callback function to set up the model schema.
 * @return {undefined}
 */
export default function(table, schemaCallback) {
    bookshelf.knex.schema.hasTable(table).then((exists) => {
        if (!exists) {
            console.log(`Creating '${table}' table.`);
            bookshelf.knex.schema.createTable(table, schemaCallback).then(() => {
                console.log(`'${table}' table created successfully.`);
            });
        }
    });
};
