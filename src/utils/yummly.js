import request from 'request';
import _ from 'lodash';
import yummlyConfig from '../../config/yummly';

export default function get(params) {
    const {path, queryParams = {}, jsonp = false, body = null} = params;

    return new Promise((resolve, reject) => {
        let requestParams = {
            baseUrl: yummlyConfig.baseUrl,
            uri: path,
            qs: _.defaults({}, queryParams, yummlyConfig.queryParams),
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
                return reject(err);
            } else if (response.statusCode >= 400) {
                return reject(response);
            }

            // WARNING: this jsonp implementation is specific to ingredients
            if (jsonp) {
                const jsonStart = resBody.indexOf('[{');
                const jsonEnd = resBody.indexOf('}])');
                const json = JSON.parse(resBody.substring(jsonStart, jsonEnd + 2));

                resolve(json);
            } else {
                resolve(resBody);
            }
        });
    });
};
