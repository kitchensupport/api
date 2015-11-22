import bookshelf from '../utils/database';
import makeTable from '../utils/make-table';

const Model = bookshelf.Model.extend({
    tableName: 'ingredients'
});

const Collection = bookshelf.Collection.extend({
    model: Model,
    serialize({status, offset = 0, limit = this.size()}) {
        return {
            status,
            matches: this.size(),
            ingredients: this.slice(offset, offset + limit)
        };
    }
});

export default function initialize() {
    makeTable('ingredients', (schema) => {
        schema.increments('id').primary();
        schema.string('searchValue').unique();
        schema.string('term');
    });

    bookshelf.model('Ingredient', Model);
    bookshelf.collection('Ingredients', Collection);
}
