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
    const value = req.query.value === 'false' ? false : true;
    const constraint = getConstraint(req.path);
    const userId = req.user.id;
    const {limit, offset} = req.page;

    UserRecipes.getRecipes({id: req.user.id, constraint, value}).then((recipes) => {
        res.status(200).send(recipes.toJSON({
            status: 'success',
            limit,
            offset,
            userId
        }));
    }).catch((err) => {
        res.status(403).send({
            status: 'failure',
            error: 'Unable to retrieve completed recipes'
        });

        next(err);
    });
});

userrecipes.post((req, res, next) => {
    UserRecipe.makeRelationship({
        userId: req.user.id,
        recipeId: req.body.recipe_id,
        action: getConstraint(req.path),
        value: req.body.value === undefined ? true : req.body.value
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
