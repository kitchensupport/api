import express from 'express';
import authorize from '../middleware/auth';
import * as get from '../utils/get-models';

const [Recipe] = get.models('Recipe');
const [Recipes] = get.collections('Recipes');
const router = express();

export function routes() {
    return router;
};

/* ********* route initialization ********* */

router.get('/recipes/search/:searchTerm', authorize({required: false}), (req, res, next) => {
    const forceNew = req.query.forceNew === 'true';
    const userId = req.user && req.user.id;
    const {limit, offset} = req.page;

    Recipes.getRecipes({forceNew, limit, offset, searchTerm: req.params.searchTerm}).then((recipes) => {
        res.status(200).send(recipes.toJSON({
            status: 'success',
            limit,
            offset,
            userId
        }));
    }).catch((err) => {
        res.status(404).send({
            status: 'failure',
            error: 'Unable to find recipes'
        });

        next(err);
    });
});

router.get('/recipe', authorize({required: false}), (req, res, next) => {
    const userId = req.user && req.user.id;

    Recipe.getRecipe(req.query).then((recipe) => {
        res.status(200).send(recipe.toJSON({
            status: 'success',
            userId
        }));
    }).catch((err) => {
        res.status(404).send({
            status: 'failure',
            error: 'Unable to retrieve recipe'
        });

        next(err);
    });
});
