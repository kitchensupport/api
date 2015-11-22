import Bluebird from 'bluebird';
import bookshelf from '../utils/database';
import makeTable from '../utils/make-table';

const Model = bookshelf.Model.extend({
    tableName: 'user_recipe',
    user() {
        return this.belongsTo(bookshelf.model('User'), 'user_id');
    },
    recipe() {
        return this.belongsTo(bookshelf.model('Recipe'), 'recipe_id');
    }
}, {
    makeRelationship: Bluebird.method(({userId, recipeId, action, value}) => {
        if (!(value === true || value === false || value === null)) {
            throw new Error('Invalid action value');
        } else if (!(action === 'favorited' || action === 'made' || action === 'liked')) {
            throw new Error('Invalid action');
        }

        return Model.where({
            user_id: userId,
            recipe_id: recipeId
        }).fetch().then((ur) => {
            if (ur) {
                if (ur.get(action) !== value) {
                    return ur.save(action, value, {patch: true});
                } else {
                    return ur;
                }
            } else {
                return new Model({
                    user_id: userId,
                    recipe_id: recipeId
                }).save(action, value);
            }
        });
    })
});

const Collection = bookshelf.Collection.extend({
    model: Model
});

export default function initialize() {
    makeTable('user_recipe', (schema) => {
        schema.increments('id').primary();
        schema.integer('user_id').references('id').inTable('users').notNullable();
        schema.integer('recipe_id').references('id').inTable('recipes').notNullable();
        schema.unique(['user_id', 'recipe_id']);
        schema.boolean('liked');
        schema.boolean('favorited').defaultTo(false).notNullable();
        schema.boolean('made').defaultTo(false).notNullable();
    });

    bookshelf.model('UserRecipe', Model);
    bookshelf.collection('UserRecipes', Collection);
};
