import User from '../models/user';

/**
 * a middleware for ensuring a valid token is included with the attaching route
 * @return {Function} - an express middleware to check for a valid token in the query parameter
 */
export default function authorize() {
    return (req, res, next) => {
        const token = req.query.api_token || req.body.api_token;

        if (!token) {
            res.status(401).send({status: 'failure', error: 'Unauthorized'});
            return next(new Error('Unauthorized'));
        }

        User.Model.where('api_token', token).fetch().then((user) => {
            req.user = user.omit('password');
            next();
        }).catch((error) => {
            res.status(401).send({status: 'failure', error: 'Unauthorized'});
            next(error);
        });
    };
};
