
// http://api.yummly.com/v1/api/recipes?_app_id=de2f0d9d&_app_key=fe0368caa1a318e28eddf0a3c857ddec&your _search_parameters

import express from 'express';
import request from 'request';

const router = express();
const yummlyBaseUrl = 'http://api.yummly.com/v1/api/recipes?_app_id=de2f0d9d&_app_key=fe0368caa1a318e28eddf0a3c857ddec';

/**
 * a middleware that lets the root server use all of the login routes
 * @return {ExpressApplication} - an express application with registered routes
 */
export function routes() {
    return router;
};

export function getRecipes(res) {
    request(yummlyBaseUrl, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            res.send(body);
        } else {
            console.log(error);
            res.status(400);
            res.send({
                status: 'failure',
                error: 'Unable to create account'
            });
        }
    });
};

export function getRecipeSearch(searchTerm) {
    return searchTerm;
};

router.get('/recipe/', (req, res) => {
    getRecipeSearch(res);
});

router.get('/recipe/search/:searchTerm', (req, res) => {
    getRecipeSearch(res, req.params.searchTerm);
});
