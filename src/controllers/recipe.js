import express from 'express';
import * as yummly from '../utils/yummly';
import * as recipe from '../models/recipe';

const router = express();

export function routes() {
    return router;
};

export function search({forceNew = false, searchTerm, limit = 30, offset = 0}) {
    if (forceNew) {
        return yummly.get({
            path: '/recipes',
            queryParams: {
                q: searchTerm,
                maxResult: limit,
                start: offset
            }
        }).then((data) => {
            return yummly.cacheMany(data.matches);
        });
    } else {
        return recipe.Collection.query((query) => {
            query.whereRaw(`data ->> 'recipeName' ILIKE ?`, [`%${searchTerm}%`]);
        }).fetch();
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
    const {forceNew = false, limit = 30, offset = 0} = req.query;

    search({forceNew, limit, offset, searchTerm: req.params.searchTerm}).then((recipes) => {
        res.status(200).send(recipes.toJSON({
            status: 'success',
            limit,
            offset
        }));
    }).catch(() => {
        res.status(404).send({
            status: 'failure',
            error: 'Unable to find recipes'
        });

        next(new Error(`Unable to search recipes like ${req.params.searchTerm}`));
    });
});

router.get('/recipe', (req, res, next) => {
    getRecipe({
        id: req.query.id,
        yummlyId: req.query.yummly_id
    }).then((recipes) => {
        res.status(200).send(recipes.toJSON({
            status: 'success'
        }));
    }).catch(() => {
        res.status(404).send({
            status: 'failure',
            error: 'Unable to retrieve recipe'
        });

        next(new Error(`Unable to retrieve recipe with id ${req.params.recipeId}`));
    });
});
