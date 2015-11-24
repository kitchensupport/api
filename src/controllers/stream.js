import express from 'express';
import * as get from '../utils/get-models';

const [Recipes] = get.collections('Recipes');
const router = express();

export function routes() {
    return router;
};

/* ********* route initialization ********* */

router.get('/stream', (req, res, next) => {
    const {limit = 30, offset = 0, forceNew = false} = req.query;

    Recipes.getRecipes({limit, offset, forceNew}).then((recipes) => {
        res.status(200).send(recipes.toJSON({
            status: 'success',
            limit,
            offset
        }));
    }).catch(() => {
        res.status(403).send({
            status: 'failure',
            error: 'Unable to retrieve recipe stream'
        });

        next(new Error('Unable to retrieve recipe stream'));
    });
});
