import express from 'express';
import request from 'request';
import _ from 'lodash';
import yummlyConfig from '../../config/yummly.js';
import Recipe from '../models/recipe';
import bookshelf from '../utils/database';

const router = express();
const db = bookshelf.knex;

export function routes() {
    return router;
};

export function yummly(params) {
    const {path, queryParams = {}, jsonp = false, body = null} = params;

    return new Promise((resolve, reject) => {
        let requestParams = {
            baseUrl: yummlyConfig.baseUrl,
            uri: path,
            qs: _.assign({}, queryParams, yummlyConfig.queryParams),
            timeout: 5000,
            followRedirects: true,
            maxRedirects: 10,
            json: !jsonp
        };

        if (body) {
            requestParams = _.assign(requestParams, {body});
        }

        request(requestParams, (err, response, resBody) => {
            if (err) {
                console.error(err);
                return reject(err);
            } else if (response.statusCode >= 400) {
                console.error(response);
                return reject(response);
            }

            if (jsonp) {
                const jsonStart = resBody.indexOf('({');
                const jsonEnd = resBody.indexOf('})');
                const json = JSON.parse(resBody.substring(jsonStart + 1, jsonEnd + 1));

                resolve(json);
            } else {
                resolve(resBody);
            }
        });
    });
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

router.get('/recipes/stream', (req, res, next) => {
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

router.get('/recipes/search/:searchTerm', (req, res, next) => {
    yummly({
        path: '/recipes',
        queryParams: {
            q: req.params.searchTerm
        }
    }).then((data) => {
        res.status(200).send({
            status: 'success',
            data
        });
    }).catch(() => {
        res.status(400).send({
            status: 'failure',
            error: 'Unable to search for recipes'
        });

        next(new Error(`Unable to search recipes like ${req.params.searchTerm}`));
    });
});

router.get('/recipe/:recipeId', (req, res, next) => {
    yummly({
        path: `recipe/${req.params.recipeId}`
    }).then((data) => {
        res.status(200).send({
            status: 'success',
            data
        });
    }).catch(() => {
        res.status(400).send({
            status: 'failure',
            error: 'Unable to retrieve recipe'
        });

        next(new Error(`Unable to retrieve recipe with id ${req.params.recipeId}`));
    });
});
