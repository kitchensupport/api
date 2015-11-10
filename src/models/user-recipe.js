import bookshelf from '../utils/database';
import model from '../utils/model';
import {Model as User} from './user';
import {Model as Recipe} from './recipe';

model('user_recipe', (schema) => {
    schema.increments('id').primary();
    schema.integer('user_id').references('id').inTable('users').notNullable();
    schema.integer('recipe_id').references('id').inTable('recipes').notNullable();
    schema.unique(['user_id', 'recipe_id']);
    schema.boolean('liked');
    schema.boolean('favorited').defaultTo(false).notNullable();
    schema.boolean('made').defaultTo(false).notNullable();
});

export const Model = bookshelf.Model.extend({
    tableName: 'user_recipe',

    user() {
        return this.belongsTo(User, 'user_id');
    },

    recipe() {
        return this.belongsTo(Recipe, 'recipe_id');
    }
});

export const Collection = bookshelf.Collection.extend({
    model: Model
});

export function makeRelationship({userId, recipeId, action, value}) {
    return new Promise((resolve, reject) => {
        if (!(value === true || value === false || value === null)) {
            return reject(new Error('Invalid action value'));
        } else if (!(action === 'favorited' || action === 'made' || action === 'liked')) {
            return reject(new Error('Invalid action'));
        }

        Model.where({
            user_id: userId,
            recipe_id: recipeId
        }).fetch().then((ur) => {
            if (ur) {
                if (ur.get(action) !== value) {
                    return ur.save(action, value, {patch: true});
                } else {
                    return resolve(ur);
                }
            } else {
                return new Model({
                    user_id: userId,
                    recipe_id: recipeId
                }).save(action, value);
            }
        }).then(resolve).catch(reject);
    });

};
