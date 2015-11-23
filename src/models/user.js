import bcrypt from 'bcrypt';
import _ from 'lodash';
import Bluebird from 'bluebird';
import bookshelf from '../utils/database';
import makeTable from '../utils/make-table';
import getModels from '../utils/get-models';

const [Recipe] = getModels('Recipe');
const bcryptCompare = Bluebird.promisify(bcrypt.compare);
const bcryptHash = Bluebird.promisify(bcrypt.hash);

const hashPassword = Bluebird.method((model, attrs) => {
    if (!model.has('password') || !attrs.password) {
        throw new Error('A password must be provided');
    }

    return bcryptHash(attrs.password, 10).then((hash) => {
        model.set('password', hash);
        return hash;
    }).catch(() => {
        return new Error('Could not hash password');
    });
});

const Model = bookshelf.Model.extend({
    tableName: 'users',
    hasTimestamps: true,
    initialize() {
        this.on('creating', hashPassword, this);
    },
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
    login: Bluebird.method((attrs = {}) => {
        const {password, email} = attrs;

        if (!password) {
            throw new Error('A password must be provided');
        }

        return Model.where({email, password}).fetch({require: true}).catch(() => {
            return new Error('Could not find a user with that email and password');
        }).then((user) => {
            return bcryptCompare(password, user.get('password')).then((result) => {
                if (!result) {
                    throw new Error('Passwords to not match');
                }

                return user;
            });
        });

    })
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
