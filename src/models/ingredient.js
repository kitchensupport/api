import bookshelf from '../utils/database';
import model from '../utils/model';

model('ingredients', (schema) => {
    schema.increments('id').primary();
    schema.string('searchValue').unique();
    schema.string('term');
});

export const Model = bookshelf.Model.extend({
    tableName: 'ingredients'
});

export const Collection = bookshelf.Collection.extend({
    model: Model,
    serialize({status, offset = 0, limit = this.size()}) {
        return {
            status,
            matches: this.size(),
            ingredients: this.slice(offset, offset + limit)
        };
    }
});
