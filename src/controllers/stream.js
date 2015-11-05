import express from 'express';
import _ from 'lodash';
import yummly from '../utils/yummly';
import bookshelf from '../utils/database';
import Recipe from '../models/recipe';

const router = express();
const db = bookshelf.knex;

export function routes() {
    return router;
};

export function getRecipeStream(params) {
    const {queryParams = {}} = params;

    return yummly({
        path: '/recipes',
        queryParams
    }).then((data) => {
        const yummlyIds = data.matches.map((recipe) => {
            return recipe.id;
        });

        return Recipe.collection().query((query) => {
            query.whereIn('yummly_id', yummlyIds);
        }).fetch().then((collection) => {
            const dbIds = collection.map((dbEntry) => {
                return dbEntry.get('yummly_id');
            });

            // we only want to insert recipes that arent in the database yet, since recipes should be unique
            return _.filter(data.matches, (recipe) => {
                return (dbIds.indexOf(recipe.id) === -1);
            });
        }).then((newRecipes) => {
            const recipesToInsert = newRecipes.map((recipe) => {
                return {yummly_id: recipe.id, data: recipe};
            });

            return db.insert(recipesToInsert).into('recipes');
        }).then(() => {

            // TODO: merge data from the db and the data from the API call together in some meaningful way
            return data;
        });
    });
};

/* ********* route initialization ********* */

router.get('/stream', (req, res, next) => {
    getRecipeStream({
        queryParams: _.omit(req.query, 'api_token')
    }).then((data) => {
        res.status(200).send({
            status: 'success',
            stream: data.matches
        });
    }).catch(() => {
        res.status(400).send({
            status: 'failure',
            error: 'Unable to retrieve featured recipes'
        });

        next(new Error('Unable to retrieve featured recipes'));
    });
});
