import express from 'express';
import * as get from '../utils/get-models';

const [Recipe] = get.models('Recipe');
const [Recipes] = get.collections('Recipes');
const router = express();

export function routes() {
    return router;
};

/* ********* route initialization ********* */

router.get('/recipes/search/:searchTerm', (req, res, next) => {
    const {forceNew = false, limit = 30, offset = 0} = req.query;

    Recipes.getRecipes({forceNew, limit, offset, searchTerm: req.params.searchTerm}).then((recipes) => {
        res.status(200).send(recipes.toJSON({
            status: 'success',
            limit,
            offset
        }));
    }).catch(() => {
        res.status(404).send({
            status: 'failure',
            error: 'Unable to find recipes'
        });

        next(new Error(`Unable to search recipes like ${req.params.searchTerm}`));
    });
});

router.get('/recipe', (req, res, next) => {
    Recipe.getRecipe(req.query).then((recipes) => {
        res.status(200).send(recipes.toJSON({
            status: 'success'
        }));
    }).catch(() => {
        res.status(404).send({
            status: 'failure',
            error: 'Unable to retrieve recipe'
        });

        next(new Error(`Unable to retrieve recipe with id ${req.params.recipeId}`));
    });
});
