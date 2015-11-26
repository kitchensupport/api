import bookshelf from '../utils/database';
import makeTable from '../utils/make-table';
import * as get from '../utils/get-models';

let Ingredient;

const Model = bookshelf.Model.extend({
    tableName: 'pantry',
    hasTimestamps: true,
    initialize() {
        this.on('fetching', (model) => {
            return model.load('ingredient');
        });
    },
    ingredient() {
        return this.belongsTo(Ingredient, 'ingredient_id');
    },
    serialize() {
        return this.related('ingredient').toJSON({
            last_updated: this.get('updated_at')
        });
    }
}, {
    upsert({userId, ingredientId}) {
        const model = new Model({
            user_id: userId,
            ingredient_id: ingredientId
        });

        return model.fetch().then((item) => {
            if (item) {
                return item.save({active: true}, {patch: true});
            }

            return model.save();
        });
    }
});

const Collection = bookshelf.Collection.extend({
    model: Model,
    serialize(additional = {}) {
        const {status, limit = this.size(), offset = 0} = additional;

        return {
            status,
            matches: this.size(),
            items: this.slice(offset, offset + limit)
        };
    }
}, {
    getByUserId(userId) {
        return new Collection().query((query) => {
            query.where({user_id: userId, active: true}).orderBy('id');
        }).fetch();
    }
});

export function register() {
    makeTable('pantry', (schema) => {
        schema.increments('id').primary();
        schema.integer('user_id').references('id').inTable('users').notNullable();
        schema.integer('ingredient_id').references('id').inTable('ingredients').notNullable();
        schema.unique(['user_id', 'ingredient_id']);
        schema.boolean('active').notNullable().defaultTo(true);
        schema.timestamps();
    });

    bookshelf.model('PantryItem', Model);
    bookshelf.collection('Pantry', Collection);
};

export function load() {
    [Ingredient] = get.models('Ingredient');
};
