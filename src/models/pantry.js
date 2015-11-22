import bookshelf from '../utils/database';
import makeTable from '../utils/make-table';

const Model = bookshelf.Model.extend({
    tableName: 'pantry',
    hasTimestamps: true,
    ingredient() {
        return this.belongsTo(bookshelf.model('Ingredient'), 'ingredient_id');
    },
    serialize() {
        const ingredient = this.related('ingredient').toJSON();

        ingredient.last_updated = this.get('updated_at');

        return ingredient;
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
});

export default function initialize() {
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
}
