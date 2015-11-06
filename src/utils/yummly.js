import request from 'request';
import _ from 'lodash';
import {Model as Recipe, Collection as RecipeCollection} from '../models/recipe';
import yummlyConfig from '../../config/yummly';

/**
 * Takes a single recipe and caches it in the database if it doesn't already exist
 * @param recipe {Object} - A single recipe object, from the Yummly API
 * @return {Promise} - resolves with either the saved recipe, or rejects with an error (unrelated to the recipe already existing)
 */
export function cacheOne(recipe) {
    return new Promise((resolve, reject) => {
        Recipe.where({yummly_id: recipe.id}).fetch().then((_recipe) => {
            if (_recipe) {
                return resolve(_recipe);
            }

            new Recipe({yummly_id: recipe.id, data: recipe}).save().then(resolve).catch(reject);
        }).catch(reject);
    });
};

/**
 * Takes in an array of recipes and caches them in the database if they dont already exist
 * @param yummlyRecipes {Array} - An array of recipe objects, directly from the Yummly API
 * @param options {Object} - An object of options
 * @param options.collection {Boolean} - If true, return a Recipe.collection() version of the data
 * @return {Promise} - resolves with a collection of Recipes, or rejects with an error
 */
export function cacheMany(yummlyRecipes) {
    const yummlyIds = yummlyRecipes.map((recipe) => {
        return recipe.id;
    });

    return RecipeCollection.query((query) => {
        query.whereIn('yummly_id', yummlyIds);
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
            return new Recipe({yummly_id: recipe.id, data: recipe});
        })).invokeThen('save').then(() => {
            return collection;
        });
    }).catch(() => {
        return new Error('Could not cache recipes');
    });
};

export function get(params) {
    const {path, queryParams = {}, jsonp = false, body = null} = params;

    return new Promise((resolve, reject) => {
        let requestParams = {
            baseUrl: yummlyConfig.baseUrl,
            uri: path,
            qs: _.defaults({}, queryParams, yummlyConfig.queryParams),
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
                return reject(err);
            } else if (response.statusCode >= 400) {
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
