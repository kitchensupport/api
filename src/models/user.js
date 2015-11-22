import bcrypt from 'bcrypt';
import _ from 'lodash';
import Bluebird from 'bluebird';
import bookshelf from '../utils/database';
import makeTable from '../utils/make-table';
import getModels from '../utils/get-models';

const [Recipe] = getModels('Recipe');

const Model = bookshelf.Model.extend({
    tableName: 'users',
    hasTimestamps: true,
    likes() {
        return this.belongsToMany(Recipe, 'user_recipe', 'user_id', 'recipe_id').query((query) => {
            query.where({liked: true});
        });
    },
    favorites() {
        return this.belongsToMany(Recipe, 'user_recipe', 'user_id', 'recipe_id').query((query) => {
            query.where({favorited: true});
        });
    },
    made() {
        return this.belongsToMany(Recipe, 'user_recipe', 'user_id', 'recipe_id').query((query) => {
            query.where({made: true});
        });
    },
    serialize(additional = {}) {
        const data = this.omit('password');

        return _.assign(data, additional);
    }
}, {
    checkPassword(password) {
        return new Bluebird((resolve, reject) => {
            bcrypt.compare(password, this.get('password'), (error, result) => {
                if (error || !result) {
                    return reject(new Error('Passwords do not match'));
                } else {
                    return resolve(this);
                }
            });
        });
    },
    hashPassword(password) {
        return new Bluebird((resolve, reject) => {
            bcrypt.hash(password, 10, (error, hash) => {
                if (error) {
                    return reject(error);
                }

                return resolve(hash);
            });
        });
    }
});

const Collection = bookshelf.Collection.extend({
    model: Model
});

export default function initialize() {
    makeTable('users', (schema) => {
        schema.increments('id').primary();
        schema.string('email').unique();
        schema.string('password');
        schema.string('facebook_token').unique();
        schema.string('api_token').unique();
        schema.timestamps();
    });

    bookshelf.model('User', Model);
    bookshelf.collection('Users', Collection);
};
