import express from 'express';
import _ from 'lodash';
import * as yummly from '../utils/yummly';
import * as recipe from '../models/recipe';

const router = express();

export function routes() {
    return router;
};

export function search({forceNew = false, searchTerm, maxResult = 30, offset = 0}) {
    if (forceNew) {
        return yummly.get({
            path: '/recipes',
            queryParams: {
                q: searchTerm,
                maxResult,
                offset
            }
        }).then((data) => {
            return yummly.cacheMany(data.matches);
        });
    } else {
        return recipe.Collection.query((query) => {
            query.whereRaw(`data ->> 'recipeName' ilike ?`, [`%${searchTerm}%`]).limit(maxResult);
        }).fetch().then((collection) => {
            return collection;
        });
    }

};

export function getRecipe({id, yummlyId}) {
    if (id) {
        return recipe.Model.where({id}).fetch();
    } else {
        return recipe.Model.where({yummly_id: yummlyId}).fetch();
    }

};

/* ********* route initialization ********* */

router.get('/recipes/search/:searchTerm', (req, res, next) => {
    search({
        forceNew: req.query.forceNew,
        searchTerm: req.params.searchTerm,
        maxResult: req.query.maxResult,
        offset: req.query.offset
    }).then((recipes) => {
        res.status(200).send(recipes.toJSON({status: 'success'}));
    }).catch(() => {
        res.status(404).send({
            status: 'failure',
            error: 'Unable to search for recipes'
        });

        next(new Error(`Unable to search recipes like ${req.params.searchTerm}`));
    });
});

router.get('/recipe', (req, res, next) => {
    getRecipe({
        id: req.query.id,
        yummlyId: req.query.yummly_id
    }).then((recipes) => {
        res.status(200).send(_.defaults({}, recipes.toJSON(), {
            status: 'success'
        }));
    }).catch((err) => {
        console.error(err);
        res.status(400).send({
            status: 'failure',
            error: 'Unable to retrieve recipe'
        });

        next(new Error(`Unable to retrieve recipe with id ${req.params.recipeId}`));
    });
});
