import bcrypt from 'bcrypt';
import _ from 'lodash';
import Bluebird from 'bluebird';
import bookshelf from '../utils/database';
import makeTable from '../utils/make-table';
import getModels from '../utils/get-models';

const [Recipe] = getModels('Recipe');
const bcryptCompare = Bluebird.promisify(bcrypt.compare);
const bcryptHash = Bluebird.promisify(bcrypt.hash);

function hashPassword(password, model) {
    return bcryptHash(password, 10).then((hash) => {
        model.set('password', hash);
        return model;
    }).catch(() => {
        return new Error('Could not hash password');
    });
}

const onSaving = Bluebird.method((model, attrs) => {

    // we can only do this because the only reason we would ever update a user is to update the password
    if (!attrs.password) {
        throw new Error('A password must be provided');
    }

    return hashPassword(attrs.password, model);
});

const onFetching = Bluebird.method((model, columns, options) => {

    // just getting a user normally
    if (options.login !== true) {
        return model;
    }

    // logging in
    if (!model.get('password')) {
        throw new Error('A password must be provided');
    }

    return hashPassword(model.get('password'), model);
});

const Model = bookshelf.Model.extend({
    tableName: 'users',
    hasTimestamps: true,
    initialize() {
        this.on('saving', onSaving, this);
        this.on('fetching', onFetching, this);
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

        return new Model({email, password}).fetch({require: true, login: true}).catch(() => {
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
