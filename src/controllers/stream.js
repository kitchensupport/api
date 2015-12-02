import express from 'express';
import authorize from '../middleware/auth';
import * as get from '../utils/get-models';

const [Recipes] = get.collections('Recipes');
const router = express();

export function routes() {
    return router;
};

/* ********* route initialization ********* */

router.get('/stream', authorize({required: false}), (req, res, next) => {
    const forceNew = req.query.forceNew === 'true';
    const userId = req.user && req.user.id;
    const {limit, offset} = req.page;

    Recipes.getRecipes({limit, offset, forceNew}).then((recipes) => {
        res.status(200).send(recipes.toJSON({
            status: 'success',
            limit,
            offset,
            userId
        }));
    }).catch((err) => {
        res.status(403).send({
            status: 'failure',
            error: err.message
        });

        next(err);
    });
});
