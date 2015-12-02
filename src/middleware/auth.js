import * as get from '../utils/get-models';

const [User] = get.models('User');

/**
 * a middleware for ensuring a valid token is included with the attaching route
 * @return {Function} - an express middleware to check for a valid token in the query parameter
 */
export default function authorize({required = true} = {}) {
    return (req, res, next) => {
        const token = req.query.api_token || req.body.api_token;

        if (!token) {
            if (required) {
                res.status(401).send({status: 'failure', error: 'Unauthorized'});
                return next(new Error('Unauthorized'));
            } else {
                return next();
            }
        } else {
            User.where('api_token', token).fetch({require: true}).then((user) => {
                req.user = user.toJSON();
                return next();
            }).catch((error) => {
                if (required) {
                    res.status(401).send({status: 'failure', error: 'Unauthorized'});
                    return next(error);
                } else {
                    return next();
                }
            });
        }
    };
};
