import express from 'express';
import uuid from 'node-uuid';
import request from 'request';
import {send as sendMail} from '../utils/email';
import User from '../models/user';
import PasswordResetToken from '../models/password-reset';

const router = express();

/**
 * a middleware that lets the root server use all of the login routes
 * sets up nodemailer for use by the module later
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

        User.hashPassword(password)
            .then((hash) => {
                return new User.Model({email, password: hash, facebook_token: facebookToken, api_token: token}).save();
            }).then((user) => {
                if (user) {
                    resolve(user.omit('password'));
                } else {
                    reject(new Error('The user could not be saved'));
                }
            }).catch(reject);
    });
};

export function getAttributes(attrs, fetch) {
    return new Promise((resolve, reject) => {
        if (attrs.email && attrs.password) {
            process.nextTick(() => {
                resolve({email: attrs.email, password: attrs.password});
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
            User.Model.where({email})
                .fetch()
                .then((user) => {
                    if (user) {
                        return user.checkPassword(password);
                    } else {
                        return reject(new Error('No user found with that email'));
                    }
                })
                .then((user) => {
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

export function sendResetToken(user) {
    const token = uuid.v4();

    return new Promise((resolve, reject) => {
        PasswordResetToken.where({user_id: user.id})
            .fetch()
            .then((model) => {
                if (!model) {
                    return new PasswordResetToken({
                        user_id: user.id,
                        reset_token: token
                    }).save();
                } else {
                    return model.save({reset_token: token}, {patch: true});
                }
            }).then(() => {
                return sendMail({
                    to: user.email,
                    subject: 'Reset your Kitchen Support password',
                    text: `Hey there, you seem to have requested a password reset. Click on the link below to enter your new password! Warning: the link is only active for 30 minutes from the time that this email is sent!\n\nhttp://kitchen.support/#/forgot-password/${token}\n\nIf this wasnt you, you can disregard this email.`
                });
            }).then(resolve).catch(reject);
    });
};

export function resetPassword(req) {
    const {password, reset_token} = req;

    return Promise.all([
        PasswordResetToken.where('reset_token', reset_token).fetch({
            withRelated: 'user'
        }),
        User.hashPassword(password)
    ]).then((values) => {
        if (!values[0]) {
            throw new Error('Invalid reset token');
        }

        const expireDate = new Date(values[0].get('expire_date'));
        const newPassword = values[1];

        return values[0].destroy().then((resetToken) => {
            if (new Date() > expireDate) {
                throw new Error('Invalid reset token');
            } else {
                return resetToken.related('user').save({
                    password: newPassword
                }, {
                    patch: true
                });
            }
        });
    });
};

/* ********* route initialization ********* */

router.post('/accounts/create', (req, res, next) => {
    getAttributes(req.body, true)
        .then(createUser)
        .then((user) => {
            res.status(200).send({
                status: 'success',
                user
            });
        }).catch((err) => {
            res.status(400).send({
                status: 'failure',
                error: 'Unable to create account'
            });

            next(err);
        });
});

router.post('/accounts/login', (req, res, next) => {
    getAttributes(req.body)
        .then(logUserIn)
        .then((user) => {
            res.status(200).send({
                status: 'success',
                user
            });
        }).catch((err) => {
            res.status(400).send({
                status: 'failure',
                error: 'Invalid username or password'
            });

            next(err);
        });
});

router.get('/account', (req, res, next) => {
    getUser({api_token: req.query.token})
        .then((user) => {
            res.status(200).send({
                status: 'success',
                user
            });
        }).catch((err) => {
            res.status(401).send({
                status: 'failure',
                error: 'No user associated with that token'
            });

            next(err);
        });
});

router.post('/accounts/reset/request', (req, res, next) => {
    getUser({email: req.body.email})
        .then(sendResetToken)
        .then(() => {
            res.status(200).send({status: 'success'});
        }).catch((err) => {
            res.status(500).send({status: 'failure'});
            next(err);
        });
});

router.post('/accounts/reset/confirm', (req, res, next) => {
    resetPassword(req.body).then(() => {
        res.status(200).send({status: 'success'});
    }).catch((err) => {
        res.status(500).send({status: 'failure'});
        next(err);
    });
});
