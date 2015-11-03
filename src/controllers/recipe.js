import express from 'express';
import yummly from '../utils/yummly';

const router = express();

export function routes() {
    return router;
};

/* ********* route initialization ********* */

router.get('/recipes/search/:searchTerm', (req, res, next) => {
    yummly({
        path: '/recipes',
        queryParams: {
            q: req.params.searchTerm
        }
    }).then((data) => {
        res.status(200).send({
            status: 'success',
            data
        });
    }).catch(() => {
        res.status(400).send({
            status: 'failure',
            error: 'Unable to search for recipes'
        });

        next(new Error(`Unable to search recipes like ${req.params.searchTerm}`));
    });
});

router.get('/recipe/:recipeId', (req, res, next) => {
    yummly({
        path: `recipe/${req.params.recipeId}`
    }).then((data) => {
        res.status(200).send({
            status: 'success',
            data
        });
    }).catch(() => {
        res.status(400).send({
            status: 'failure',
            error: 'Unable to retrieve recipe'
        });

        next(new Error(`Unable to retrieve recipe with id ${req.params.recipeId}`));
    });
});
