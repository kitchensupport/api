import express from 'express';
import * as get from '../utils/get-models';

const [Ingredients] = get.collections('Ingredients');
const router = express();

export function routes() {
    return router;
};

/* ********* route initialization ********* */

router.get('/ingredients', (req, res, next) => {
    const {limit, offset} = req.page;

    Ingredients.getIngredients().then((ingredients) => {
        res.status(200).send(ingredients.toJSON({
            status: 'success',
            limit,
            offset
        }));
    }).catch((err) => {
        res.status(403).send({
            status: 'failure',
            error: 'Unable to get ingredients'
        });

        next(err);
    });
});

router.get('/ingredients/:search', (req, res, next) => {
    const {limit, offset} = req.page;

    Ingredients.getIngredients({searchTerm: req.params.search}).then((ingredients) => {
        res.status(200).send(ingredients.toJSON({
            status: 'success',
            limit,
            offset
        }));
    }).catch((err) => {
        res.status(404).send({
            status: 'failure',
            error: `No ingredients like ${req.params.search}`
        });

        next(err);
    });
});
