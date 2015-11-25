import express from 'express';
import authorize from '../middleware/auth';
import * as get from '../utils/get-models';

const [UserRecipe] = get.models('UserRecipe');
const [UserRecipes] = get.collections('UserRecipes');
const router = express();
const constraints = {
    completed: 'made',
    favorites: 'favorited',
    likes: 'liked'
};

export function routes() {
    return router;
};

function getConstraint(path) {
    return constraints[path.substring(1)];
}

/* ********* route initialization ********* */

const userrecipes = router.route(/\/(completed|favorites|likes)/);

userrecipes.all(authorize());

userrecipes.get((req, res, next) => {
    const {limit = 30, offset = 0, value = true} = req.query;
    const constraint = getConstraint(req.path);

    UserRecipes.getRecipes({id: req.user.id, constraint, value}).then((recipes) => {
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

userrecipes.post((req, res, next) => {
    UserRecipe.makeRelationship({
        userId: req.user.id,
        recipeId: req.body.recipe_id,
        action: getConstraint(req.path),
        value: true
    }).then(() => {
        res.status(200).send({
            status: 'success'
        });
    }).catch((err) => {
        res.status(403).send({
            status: 'failure',
            error: err.message
        });

        next(err);
    });
});

userrecipes.delete((req, res, next) => {
    UserRecipe.makeRelationship({
        userId: req.user.id,
        recipeId: req.body.recipe_id,
        action: getConstraint(req.path),
        value: false
    }).then(() => {
        res.status(200).send({
            status: 'success'
        });
    }).catch((err) => {
        res.status(403).send({
            status: 'failure',
            error: err.message
        });

        next(err);
    });
});
