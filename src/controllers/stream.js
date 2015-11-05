import express from 'express';
import * as yummly from '../utils/yummly';
import * as recipe from '../models/recipe';

const router = express();

export function routes() {
    return router;
};

export function getRecipeStream({forceNew = true, maxResult = 30, offset = 0}) {
    if (forceNew) {
        return yummly.get({
            path: '/recipes',
            q: {
                maxResult,
                offset
            }
        }).then((data) => {
            return yummly.cacheMany(data.matches);
        });
    } else {
        return recipe.Collection.query((query) => {
            query.limit(30).orderByRaw('RANDOM()');
        }).fetch();
    }
};

/* ********* route initialization ********* */

router.get('/stream', (req, res, next) => {
    getRecipeStream({
        forceNew: req.query.forceNew,
        maxResults: req.query.maxResults,
        offset: req.query.offset
    }).then((recipes) => {
        const recipesJSON = recipes.toJSON();

        recipesJSON.status = 'success';
        res.status(200).send(recipesJSON);
    }).catch(() => {
        res.status(403).send({
            status: 'failure',
            error: 'Unable to retrieve featured recipes'
        });

        next(new Error('Unable to retrieve featured recipes'));
    });
});
