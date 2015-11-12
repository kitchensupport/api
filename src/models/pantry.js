import bookshelf from '../utils/database';
import model from '../utils/model';
import {Model as Ingredient} from './ingredient';

model('pantry', (schema) => {
    schema.increments('id').primary();
    schema.integer('user_id').references('id').inTable('users').notNullable();
    schema.integer('ingredient_id').references('id').inTable('ingredients').notNullable();
    schema.unique(['user_id', 'ingredient_id']);
    schema.boolean('active').notNullable().defaultTo(true);
    schema.timestamps();
});

export const Model = bookshelf.Model.extend({
    tableName: 'pantry',
    hasTimestamps: true,
    ingredient() {
        return this.belongsTo(Ingredient, 'ingredient_id');
    },
    serialize() {
        const ingredient = this.related('ingredient').toJSON();

        ingredient.last_updated = this.get('updated_at');

        return ingredient;
    }
});

export const Collection = bookshelf.Collection.extend({
    model: Model,
    serialize({status, offset = 0, limit = this.size()}) {
        return {
            status,
            matches: this.size(),
            items: this.slice(offset, offset + limit)
        };
    }
});
