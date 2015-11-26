import bookshelf from '../utils/database';
import makeTable from '../utils/make-table';
import * as get from '../utils/get-models';

let Recipes;

const Model = bookshelf.Model.extend({
    tableName: 'ingredients',
    recipes() {
        return Recipes.query((query) => {
            query.whereRaw(`data -> 'ingredients' @> ?`, [JSON.stringify([this.searchTerm])]);
        }).fetch();
    }
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

export function register() {
    makeTable('ingredients', (schema) => {
        schema.increments('id').primary();
        schema.string('searchValue').unique();
        schema.string('term');
    });

    bookshelf.model('Ingredient', Model);
    bookshelf.collection('Ingredients', Collection);
};

export function load() {
    [Recipes] = get.collections('Recipes');
};
