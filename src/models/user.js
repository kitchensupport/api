import bcrypt from 'bcrypt';
import Recipe from './recipe';
import bookshelf from '../utils/database';
import model from '../utils/model';

model('users', (schema) => {
    schema.increments('id').primary();
    schema.string('email').unique();
    schema.string('password');
    schema.string('facebook_token').unique();
    schema.string('api_token').unique();
    schema.timestamps();
});

const Model = bookshelf.Model.extend({
    tableName: 'users',

    hasTimestamps: true,

    checkPassword(password) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, this.attributes.password, (error, result) => {
                if (error || !result) {
                    return reject(new Error('Passwords do not match'));
                } else {
                    return resolve(this);
                }
            });
        });
    },

    likes() {
        return this.belongsToMany(Recipe, 'likes', 'user_id', 'recipe_id');
    },

    serialize() {
        return this.omit('password');
    }
});

function hashPassword(password) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, (error, hash) => {
            if (error) {
                return reject(error);
            }

            return resolve(hash);
        });
    });
};

export default {
    Model,
    hashPassword
};
