import bookshelf from '../utils/database';
import model from '../utils/model';

model('recipes', (schema) => {
    schema.increments('id').primary();
    schema.string('yummly_id').unique();
    schema.json('data', true).notNullable();
});

export default bookshelf.Model.extend({
    tableName: 'recipes',

    serialize() {
        const id = this.get('id');
        const data = this.get('data');

        data.yummly_id = data.id;
        delete data.id;

        return {
            id,
            data
        };
    }

    // TODO: implement central store to store models so we can have a cyclic relationship
});
