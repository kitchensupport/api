import express from 'express';
import authorize from '../middleware/auth';
import {Collection as RecipeCollection} from '../models/recipe';
import {Collection as UserRecipeCollection, makeRelationship} from '../models/user-recipe';

const router = express();

export function routes() {
    return router;
};

/* ********* route initialization ********* */

router.use(authorize());
const completed = router.route('/completed');

completed.get((req, res, next) => {
    UserRecipeCollection.query((query) => {
        query.where({
            user_id: req.user.id,
            made: true
        }).limit(req.query.limit || 30)
        .offset(req.query.offset || 0)
        .orderBy('id');
    }).fetch({withRelated: ['recipe']}).then((urs) => {
        res.status(200).send(new RecipeCollection(urs.map((ur) => {
            return ur.related('recipe');
        })).toJSON({
            status: 'success'
        }));
    }).catch(() => {
        res.status(403).send({
            status: 'failure',
            error: 'Unable to retrieve completed recipes'
        });

        next(new Error(`Unable to load completed recipes for user ${req.user.id}`));
    });
});

completed.post((req, res, next) => {
    makeRelationship({
        userId: req.user.id,
        recipeId: req.body.recipe_id,
        action: 'made',
        value: req.body.value
    }).then(() => {
        res.status(200).send({
            status: 'success'
        });
    }).catch(() => {
        res.status(403).send({
            status: 'failure',
            error: 'Can not favorite this recipe'
        });

        next(new Error(`User ${req.user.id} can not favorite recipe ${req.body.recipe_id}`));
    });
});

completed.delete((req, res, next) => {
    makeRelationship({
        userId: req.user.id,
        recipeId: req.body.recipe_id,
        action: 'made',
        value: null
    }).then(() => {
        res.status(200).send({
            status: 'success'
        });
    }).catch(() => {
        res.status(403).send({
            status: 'failure',
            error: 'Can not favorite this recipe'
        });

        next(new Error(`User ${req.user.id} can not delete favorited recipe ${req.body.recipe_id}`));
    });
});
