import _ from 'lodash';
import bookshelf from '../utils/database';
import makeTable from '../utils/make-table';
import * as get from '../utils/get-models';
import yummly from '../utils/yummly';

const [UserRecipe] = get.models('UserRecipe');

const Model = bookshelf.Model.extend({
    tableName: 'recipes',
    initialize() {
        this.on('fetching saved', (model) => {
            return model.load('userRecipes');
        });
    },
    userRecipes() {
        return this.hasMany(UserRecipe, 'recipe_id');
    },
    serialize(additional = {}) {
        const data = this.get('data');
        const yummlyId = data.id;
        const id = this.get('id');
        const userId = additional.user_id;
        const related = this.related('userRecipes');
        let likes = 0;
        let favorites = 0;
        let completions = 0;
        let liked = null;
        let favorited = false;
        let completed = false;

        related.each((ur) => {
            if (userId === ur.user_id) {
                liked = ur.liked;
                favorited = ur.favorited;
                completed = ur.made;
            }

            if (ur.liked === true) { likes++; }
            if (ur.favorited === true) { favorites++; }
            if (ur.made === true) { completions++; }
        });

        return _.assign(data, {
            yummly_id: yummlyId,
            id,
            likes,
            favorites,
            completions,
            liked,
            favorited,
            completed
        }, additional);
    }
}, {
    getRecipe({id, yummlyId} = {}) {
        if (id) {
            return Model.where({id}).fetch();
        } else {
            return Model.where({yummly_id: yummlyId}).fetch();
        }
    }
});

const Collection = bookshelf.Collection.extend({
    model: Model,
    serialize(additional = {}) {
        const {status, limit = this.size(), offset = 0} = additional;

        return {
            status,
            matches: this.size(),
            recipes: this.slice(offset, offset + limit)
        };
    }
}, {
    getRecipes({forceNew = false, searchTerm, offset = 0, limit = 30} = {}) {
        if (forceNew) {
            const queryParams = {start: offset, maxRecipes: limit};

            if (searchTerm) {
                queryParams.q = searchTerm;
            }

            return yummly({
                path: '/recipes',
                queryParams
            }).then((data) => {
                return cacheMany(data.matches); // eslint-disable-line no-use-before-define
            });
        } else if (searchTerm) {
            return new Collection().query((query) => {
                query.whereRaw(`data ->> 'recipeName' ILIKE ?`, [`%${searchTerm}%`]);
            }).fetch();
        } else {
            return new Collection().fetch().then((collection) => {
                return collection.suffle();
            });
        }
    }
});

function cacheMany(yummlyRecipes) {
    return Collection.query((query) => {
        query.whereIn('yummly_id', yummlyRecipes.map((recipe) => {
            return recipe.id;
        }));
    }).fetch().then((collection) => {

        // get figure out which recipes in yummlyRecipes have already been saved in our db
        const dbIds = collection.map((dbEntry) => {
            return dbEntry.get('yummly_id');
        });

        // we only want to insert recipes that arent in the database yet, since recipes should be unique
        const newRecipes = _.filter(yummlyRecipes, (recipe) => {
            return (dbIds.indexOf(recipe.id) === -1);
        });

        // save the new recipes
        return collection.add(newRecipes.map((recipe) => {
            return new Model({yummly_id: recipe.id, data: recipe});
        })).invokeThen('save').then(() => {
            return collection;
        });
    }).catch(() => {
        return new Error('Could not cache recipes');
    });
}

export default function initialize() {
    makeTable('recipes', (schema) => {
        schema.increments('id').primary();
        schema.string('yummly_id').unique();
        schema.json('data', true).notNullable();
    });

    bookshelf.model('Recipe', Model);
    bookshelf.collection('Recipe', Collection);
};
