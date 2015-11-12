import express from 'express';
import authorize from '../middleware/auth';
import {Collection as RecipeCollection} from '../models/recipe';
import {Collection as UserRecipeCollection, makeRelationship} from '../models/user-recipe';

const router = express();

export function routes() {
    return router;
};

export function getFavorites({id}) {
    return UserRecipeCollection.query((query) => {
        query.where({
            user_id: id,
            favorited: true
        }).orderBy('id');
    }).fetch({withRelated: ['recipe']}).then((urs) => {
        return new RecipeCollection(urs.map((ur) => {
            return ur.related('recipe');
        }));
    });
};

/* ********* route initialization ********* */

router.use(authorize());
const favorites = router.route('/favorites');

favorites.get((req, res, next) => {
    const {limit = 30, offset = 0} = req.query;

    getFavorites({id: req.user.id}).then((recipes) => {
        res.status(200).send(recipes.toJSON({
            status: 'success',
            limit,
            offset
        }));
    }).catch(() => {
        res.status(403).send({
            status: 'failure',
            error: 'Unable to retrieve favorited recipes'
        });

        next(new Error(`Unable to load favorited recipes for user ${req.user.id}`));
    });
});

favorites.post((req, res, next) => {
    makeRelationship({
        userId: req.user.id,
        recipeId: req.body.recipe_id,
        action: 'favorited',
        value: true
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

favorites.delete((req, res, next) => {
    makeRelationship({
        userId: req.user.id,
        recipeId: req.body.recipe_id,
        action: 'favorited',
        value: false
    }).then(() => {
        res.status(200).send({
            status: 'success'
        });
    }).catch(() => {
        res.status(403).send({
            status: 'failure',
            error: 'Can not un-favorite this recipe'
        });

        next(new Error(`User ${req.user.id} can not un-favorite recipe ${req.body.recipe_id}`));
    });
});
