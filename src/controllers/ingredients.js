import express from 'express';
import * as get from '../utils/get-models';

const [Ingredients] = get.collections('Ingredients');
const router = express();

export function routes() {
    return router;
};

/* ********* route initialization ********* */

router.get('/ingredients', (req, res, next) => {
    const {limit = 30, offset = 0} = req.query;

    new Ingredients().fetch().then((ingredients) => {
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
    const {limit = 30, offset = 0} = req.query;

    new Ingredients().query((query) => {
        query.where({searchTerm: req.params.search});
    }).fetch({require: true}).then((ingredients) => {
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
