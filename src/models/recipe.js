import _ from 'lodash';
import bookshelf from '../utils/database';
import makeTable from '../utils/make-table';

const Model = bookshelf.Model.extend({
    tableName: 'recipes',
    userRecipes() {
        return this.hasMany(bookshelf.model('UserRecipe'), 'recipe_id');
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
});

export default function initialize() {
    makeTable('recipes', (schema) => {
        schema.increments('id').primary();
        schema.string('yummly_id').unique();
        schema.json('data', true).notNullable();
    });

    bookshelf.model('Recipe', Model);
    bookshelf.collection('Recipe', Collection);
};
