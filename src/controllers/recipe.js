import express from 'express';
import request from 'request';
import _ from 'lodash';
import yummlyConfig from '../../config/yummly.js';

const router = express();

export function routes() {
    return router;
};

export function yummly(params) {
    const {path, queryParams = {}, jsonp = false, body = null} = params;

    return new Promise((resolve, reject) => {
        let requestParams = {
            baseUrl: yummlyConfig.baseUrl,
            uri: path,
            qs: _.assign({}, queryParams, yummlyConfig.queryParams),
            timeout: 5000,
            followRedirects: true,
            maxRedirects: 10,
            json: !jsonp
        };

        if (body) {
            requestParams = _.assign(requestParams, {body});
        }

        request(requestParams, (err, response, resBody) => {
            if (err) {
                console.error(err);
                return reject(err);
            } else if (response.statusCode >= 400) {
                console.error(response);
                return reject(response);
            }

            if (jsonp) {
                const jsonStart = resBody.indexOf('({');
                const jsonEnd = resBody.indexOf('})');
                const json = JSON.parse(resBody.substring(jsonStart + 1, jsonEnd + 1));

                resolve(json);
            } else {
                resolve(resBody);
            }
        });
    });
};

/* ********* route initialization ********* */

router.get('/recipes/featured', (req, res, next) => {
    yummly({
        path: '/recipes',
        queryParams: {
            maxResult: 8
        }
    }).then((data) => {
        res.status(200).send({
            status: 'success',
            data
        });
    }).catch(() => {
        res.status(400).send({
            status: 'failure',
            error: 'Unable to retrieve recipes'
        });

        next(new Error('Unable to retrieve featured recipes'));
    });
});

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
