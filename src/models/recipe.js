import bookshelf from '../utils/database';
import model from '../utils/model';

model('recipes', (schema) => {
    schema.increments('id').primary();
    schema.string('yummly_id').unique();
    schema.json('data', true).notNullable();
});

export default bookshelf.Model.extend({
    tableName: 'recipes'

    // TODO: implement central store to store models so we can have a cyclic relationship
});
