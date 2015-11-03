import bookshelf from '../utils/database';
import model from '../utils/model';
import {Model as User} from './user';
import Recipe from './recipe';

model('likes', (schema) => {
    schema.increments('id').primary();
    schema.integer('user_id').references('id').inTable('users').notNullable();
    schema.integer('recipe_id').references('id').inTable('recipes').notNullable();
});

export default bookshelf.Model.extend({
    tableName: 'likes',

    user() {
        this.belongsTo(User, 'user_id');
    },

    recipe() {
        this.belongsTo(Recipe, 'recipe_id');
    }
});
