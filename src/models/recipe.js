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
    serialize({status = 'success'}) {
        const data = this.get('data');
        const id = this.get('id');

        data.yummly_id = data.id;
        data.id = id;

        return _.assign(data, {status});
    }

    // TODO: implement central store to store models so we can have a cyclic relationship
});

export const Collection = bookshelf.Collection.extend({
    model: Model,
    serialize({status = 'success', limit = this.size(), offset = 0}) {
        return {
            status,
            matches: this.size(),
            recipes: this.slice(offset, offset + limit)
        };
    }
});
