import express from 'express';
import authorize from '../middleware/auth';
import {makeRelationship} from '../models/user-recipe';

const router = express();

export function routes() {
    return router;
};

/* ********* route initialization ********* */

router.post('/likes', authorize(), (req, res, next) => {
    makeRelationship({
        userId: req.user.id,
        recipeId: req.body.recipe_id,
        action: 'liked',
        value: req.body.value
    }).then(() => {
        res.status(200).send({
            status: 'success'
        });
    }).catch(() => {
        res.status(403).send({
            status: 'failure',
            error: 'Can not like this recipe'
        });

        next(new Error(`User ${req.user.id} can not like recipe ${req.body.recipe_id}`));
    });
});
