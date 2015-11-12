import express from 'express';
import {Collection as IngredientCollection} from '../models/ingredient';

const router = express();

export function routes() {
    return router;
};

/* ********* route initialization ********* */

router.get('/ingredients', (req, res, next) => {
    const {limit = 30, offset = 0} = req.query;

    new IngredientCollection().fetch().then((ingredients) => {
        res.status(200).send(ingredients.toJSON({
            status: 'success',
            limit,
            offset
        }));
    }).catch(() => {
        res.status(403).send({
            status: 'failure',
            error: 'Unable to get ingredients'
        });

        next(new Error('Unable to retrieve ingredients'));
    });
});
