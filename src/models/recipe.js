import _ from 'lodash';
import bookshelf from '../utils/database';
import model from '../utils/model';

model('recipes', (schema) => {
    schema.increments('id').primary();
    schema.string('yummly_id').unique();
    schema.json('data', true).notNullable();
});

export const Model = bookshelf.Model.extend({
    tableName: 'recipes',
    serialize(additional = {}) {
        const data = this.get('data');
        const id = this.get('id');

        data.yummly_id = data.id;
        data.id = id;

        return _.defaults(data, additional);
    }

    // TODO: implement central store to store models so we can have a cyclic relationship
});

export const Collection = bookshelf.Collection.extend({
    model: Model,
    serialize(additional = {}) {
        return _.defaults({
            matches: this.size(),
            recipes: this.toArray()
        }, additional);
    }
});
