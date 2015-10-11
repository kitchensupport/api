import express from 'express';
import uuid from 'node-uuid';
import request from 'request';
import User from '../models/user';

const router = express();

/**
 * a middleware that lets the root server use all of the login routes
 * @return {ExpressApplication} - an express application with registered routes
 */
export function routes() {
    return router;
};

/* ***************** helpers ******************* */

/**
 * a helper function to create a new user
 * @param  {Object} attrs - an object containing an email and either a facebook token or a password
 * @return {Promise} - a native ES6 promise that resolves on successful user creation and rejects otherwise
 */
export function createUser(attrs) {
    const {email, password, facebookToken} = attrs;
    const token = uuid.v4();

    return new Promise((resolve, reject) => {

        // we want a password xor facebookToken, not both, not neither
        if (!(password || facebookToken) || (password && facebookToken)) {
            process.nextTick(() => {
                reject(new Error('A password or facebook token must be provided'));
            });

            return;
        }

        if (!email) {
            process.nextTick(() => {
                reject(new Error('An email must be provided'));
            });

            return;
        }

        new User.Model({email, password, facebook_token: facebookToken, token})
            .save()
            .then((user) => {
                resolve(user.omit('password'));
            }).catch(reject);
    });
};

export function getAttributes(attrs, fetch) {
    return new Promise((resolve, reject) => {
        if (attrs.email && attrs.password) {
            User.hashPassword(attrs.password)
                .then((hash) => {
                    resolve({email: attrs.email, password: hash});
                }).catch((error) => {
                    reject(error);
                });

            return;
        } else if (attrs.facebook_token && fetch) {
            request({
                url: 'https://graph.facebook.com/me',
                qs: {
                    access_token: attrs.facebook_token,
                    fields: 'email'
                },
                json: true
            }, (error, response) => {
                if (error) {
                    return reject(new Error('Facebook access error'));
                }

                return resolve({email: response.email, facebook_token: attrs.facebook_token});
            });
        } else if (attrs.facebook_token) {
            process.nextTick(() => {
                resolve({facebook_token: attrs.facebook_token});
            });

            return;
        } else {
            process.nextTick(() => {
                reject(new Error('A username and password must be provided'));
            });

            return;
        }
    });
};

export function getUser(attrs) {
    return new Promise((resolve, reject) => {
        User.Model.where(attrs)
            .fetch()
            .then((user) => {
                resolve(user.omit('password'));
            })
            .catch(reject);
    });
};

export function logUserIn(attrs) {
    const {email, password, facebookToken} = attrs;

    return new Promise((resolve, reject) => {
        if (!(password || facebookToken) || (password && facebookToken)) {
            process.nextTick(() => {
                reject(new Error('A password or facebook token must be provided'));
            });

            return;
        }

        if (password) {
            User.hashPassword(password)
                .then((hash) => {
                    return User.Model.where({email, password: hash}).fetch();
                }).then((user) => {
                    resolve(user.omit('password'));
                })
                .catch(reject);
        } else {
            User.Model.where({facebook_token: facebookToken})
                .fetch()
                .then((user) => {
                    resolve(user.omit('password'));
                })
                .catch(reject);
        }
    });
};

/* ********* route initialization ********* */

router.post('/accounts/create', (req, res) => {
    getAttributes(req.body, true)
        .then((attrs) => {
            return createUser(attrs, true);
        }).then((user) => {
            res.status(200);
            res.send({
                status: 'success',
                user
            });
        }).catch((error) => {
            console.log(error);
            res.status(400);
            res.send({
                status: 'failure',
                error: 'Unable to create account'
            });
        });
});

router.post('/accounts/login', (req, res) => {
    getAttributes(req.body)
        .then(logUserIn)
        .then((user) => {
            res.status(200);
            res.send({
                status: 'success',
                user
            });
        }).catch(() => {
            res.status(400);
            res.send({
                status: 'failure',
                error: 'Invalid username or password'
            });
        });
});

router.get('/account', (req, res, next) => {
    getUser({token: req.query.token})
        .then((user) => {
            res.status(200);
            res.send({
                status: 'success',
                user
            });
        }).catch((error) => {
            res.status(401);
            res.send({
                status: 'failure',
                error: 'No user associated with that token'
            });

            next(error);
        });
});
