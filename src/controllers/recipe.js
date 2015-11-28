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
    const {forceNew = false, limit = 30, offset = 0} = req.query;
    const userId = req.user && req.user.id;

    Recipes.getRecipes({forceNew, limit, offset, searchTerm: req.params.searchTerm}).then((recipes) => {
        res.status(200).send(recipes.toJSON({
            status: 'success',
            limit,
            offset,
            userId
        }));
    }).catch((err) => {
        console.error(err);
        res.status(404).send({
            status: 'failure',
            error: 'Unable to find recipes'
        });

        next(new Error(`Unable to search recipes like ${req.params.searchTerm}`));
    });
});

router.get('/recipe', authorize({required: false}), (req, res, next) => {
    const userId = req.user && req.user.id;

    Recipe.getRecipe(req.query).then((recipe) => {
        res.status(200).send(recipe.toJSON({
            status: 'success',
            userId
        }));
    }).catch(() => {
        res.status(404).send({
            status: 'failure',
            error: 'Unable to retrieve recipe'
        });

        next(new Error(`Unable to retrieve recipe with id ${req.params.recipeId}`));
    });
});
