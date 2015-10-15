
// http://api.yummly.com/v1/api/recipes?_app_id=de2f0d9d&_app_key=fe0368caa1a318e28eddf0a3c857ddec&your _search_parameters

import express from 'express';
import request from 'request';
import yummly from '../../config/yummly.js';

const router = express();
const yummlyBaseUrl = `http://api.yummly.com/v1/api/recipes?_app_id=${yummly.id}&_app_key=${yummly.key}`;

/**
 * a middleware that lets the root server use all of the login routes
 * @return {ExpressApplication} - an express application with registered routes
 */
export function routes() {
    return router;
};

router.get('/recipes/featured', (req, res) => {
    request({uri: yummlyBaseUrl,
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
                error: 'Unable to retrieve recipes.'
            });
        }
    });
});

router.get('/recipes/search/:searchTerm', (req, res) => {
    request({uri: `${yummlyBaseUrl}&q=${req.params.searchTerm}`,
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
                error: 'Unable to resolve recipe search.'
            });
        }
    });
});
