import express from 'express';
import authorize from '../middleware/auth';
import {Collection as RecipeCollection} from '../models/recipe';
import {Collection as UserRecipeCollection, makeRelationship} from '../models/user-recipe';

const router = express();

export function routes() {
    return router;
};

export function getCompleted({id}) {
    return UserRecipeCollection.query((query) => {
        query.where({
            user_id: id,
            made: true
        }).orderBy('id');
    }).fetch({withRelated: ['recipe']}).then((urs) => {
        return new RecipeCollection(urs.map((ur) => {
            return ur.related('recipe');
        }));
    });
};

/* ********* route initialization ********* */

const completed = router.route('/completed');

completed.all(authorize());

completed.get((req, res, next) => {
    const {limit = 30, offset = 0} = req.query;

    getCompleted({id: req.user.id}).then((recipes) => {
        res.status(200).send(recipes.toJSON({
            status: 'success',
            limit,
            offset
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
        value: true
    }).then(() => {
        res.status(200).send({
            status: 'success'
        });
    }).catch(() => {
        res.status(403).send({
            status: 'failure',
            error: 'Can not mark recipe as complete'
        });

        next(new Error(`User ${req.user.id} can not mark recipe ${req.body.recipe_id} as completed`));
    });
});

completed.delete((req, res, next) => {
    makeRelationship({
        userId: req.user.id,
        recipeId: req.body.recipe_id,
        action: 'made',
        value: false
    }).then(() => {
        res.status(200).send({
            status: 'success'
        });
    }).catch(() => {
        res.status(403).send({
            status: 'failure',
            error: 'Can not mark recipe as incomplete'
        });

        next(new Error(`User ${req.user.id} can not mark recipe ${req.body.recipe_id} as incomplete`));
    });
});
