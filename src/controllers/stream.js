import express from 'express';
import * as yummly from '../utils/yummly';
import {Collection as RecipeCollection} from '../models/recipe';

const router = express();

export function routes() {
    return router;
};

export function getRecipeStream({forceNew = false, limit = 30, offset = 0}) {
    if (forceNew) {
        return yummly.get({
            path: '/recipes',
            queryParams: {
                maxResult: limit,
                start: offset
            }
        }).then((data) => {
            return yummly.cacheMany(data.matches);
        });
    } else {
        return new RecipeCollection().fetch().then((collection) => {
            return new RecipeCollection(collection.shuffle());
        });
    }
};

/* ********* route initialization ********* */

router.get('/stream', (req, res, next) => {
    const {limit = 30, offset = 0, forceNew = false} = req.query;

    getRecipeStream({limit, offset, forceNew}).then((recipes) => {
        res.status(200).send(recipes.toJSON({
            status: 'success',
            limit,
            offset
        }));
    }).catch((err) => {
        console.error(err);
        res.status(403).send({
            status: 'failure',
            error: 'Unable to retrieve featured recipes'
        });

        next(new Error('Unable to retrieve featured recipes'));
    });
});
