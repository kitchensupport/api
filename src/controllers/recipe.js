import express from 'express';
import request from 'request';
import yummly from '../../config/yummly.js';

const router = express();
const YUMMLY_BASE_URL = `http://api.yummly.com/v1/api/`;
const YUMMLY_KEYS = `_app_id=${yummly.id}&_app_key=${yummly.key}`;
const YUMMLY_PARAMS = `maxResult=8`;
const YUMMLY_RECIPE_SEARCH_URL = `${YUMMLY_BASE_URL}recipes?${YUMMLY_KEYS}&${YUMMLY_PARAMS}`;

export function routes() {
    return router;
};

router.get('/recipes/featured', (req, res) => {
    request({uri: YUMMLY_RECIPE_SEARCH_URL,
        timeout: 15000,
        followRedirect: true,
        maxRedirects: 10,
        json: true
    }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            res.status(200);
            res.send({status: 'success', data: body});
        } else {
            console.log(`ER: ${error}, ${response.statusCode}`);
            res.status(400);
            res.send({
                status: 'failure',
                error: `${response.statusCode}: Unable to retrieve recipes.`
            });
        }
    });
});

router.get('/recipes/search/:searchTerm', (req, res) => {
    request({uri: `${YUMMLY_RECIPE_SEARCH_URL}&q=${req.params.searchTerm}`,
        timeout: 15000,
        followRedirect: true,
        maxRedirects: 10,
        json: true
    }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            res.status(200);
            res.send({status: 'success', data: body});
        } else {
            console.log(error);
            res.status(400);
            res.send({
                status: 'failure',
                error: `${response.statusCode}: Unable to resolve recipe search.`
            });
        }
    });
});

router.get('/recipes/recipe/:recipeId', (req, res) => {
    request({uri: `${YUMMLY_BASE_URL}recipe/${req.params.recipeId}?${YUMMLY_KEYS}&${YUMMLY_PARAMS}`,
        timeout: 15000,
        followRedirect: true,
        maxRedirects: 10,
        json: true
    }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            res.status(200);
            res.send({status: 'success', data: body});
        } else {
            console.log(error);
            res.status(400);
            res.send({
                status: 'failure',
                error: `${response.statusCode}: Unable to resolve recipe search.`
            });
        }
    });
});
