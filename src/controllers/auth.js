import express from 'express';
import uuid from 'node-uuid';
import request from 'request';
import mailer from 'nodemailer';
import User from '../models/user';
import PasswordResetToken from '../models/password-reset';
import emailConfig from '../../config/email';

const router = express();
let mailTransport;

/**
 * a middleware that lets the root server use all of the login routes
 * sets up nodemailer for use by the module later
 * @return {ExpressApplication} - an express application with registered routes
 */
export function routes() {
    mailTransport = mailer.createTransport({
        service: 'gmail',
        auth: emailConfig
    });

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
        }).catch((error) => {
            console.error(error);
            res.status(400);
            res.send({
                status: 'failure',
                error: 'Invalid username or password'
            });
        });
});

router.get('/account', (req, res, next) => {
    getUser({api_token: req.query.token})
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

router.post('/accounts/reset/request', (req, res) => {
    const token = uuid.v4();

    getUser({email: req.body.email})
        .then((user) => {
            return new PasswordResetToken({
                user_id: user.id,
                reset_token: token
            }).save();
        }).then(() => {
            mailTransport.sendMail({
                from: `Kitchen Support <${emailConfig.user}>`,
                to: req.body.email,
                replyTo: 'donotreply@kitchen.support',
                subject: 'Reset your Kitchen Support password',
                text: `Hey there, you seem to have requested a password reset. Click on the link below to enter your new password! Warning: the link is only active for 30 minutes from the time that this email is sent!\n\nhttp://kitchen.support/#/forgot-password/${token}\n\nIf this wasnt you, you can disregard this email.`
            }, (err, info) => {
                console.error(err);
                console.log(info);
                res.status(200);
                res.send({
                    status: 'success',
                    reset_token: token
                });
            });
        }).catch((error) => {
            console.error(error);
            res.status(401);
            res.send({
                status: 'failure',
                error: 'No user associated with that token and email'
            });
        });
});

router.post('/accounts/reset/confirm', (req, res) => {
    const getResetToken = PasswordResetToken.query((query) => {
        query.where('reset_token', req.body.reset_token).andWhere('expire_date', '>', new Date().toISOString());
    }).fetch();
    const hashPassword = User.hashPassword(req.body.password);

    Promise.all([getResetToken, hashPassword]).then((values) => {
        console.log(values);
        console.log(new Date().toISOString());
        User.Model.where('id', values[0].attributes.user_id)
            .save({password: values[1]}, {patch: true, method: 'update'})
            .then(() => {
                res.status(200);
                res.send();
            }).catch((error) => {
                res.status(500);
                res.send({
                    status: 'failure',
                    error
                });
            });
    }).catch((error) => {
        res.status(500);
        res.send({
            status: 'failure',
            error
        });
    });

    // PasswordResetToken.query((query) => {
    //
    //     // query.where('expire_date', '>', Date.now()).andWhere('reset_token', req.body.reset_token);
    //     query.where('reset_token', req.body.reset_token);
    // })
    //     .fetch()
    //     .then((resetToken) => {
    //         User.hashPassword(req.body.password)
    //             .then((hash) => {
    //                 console.log(hash);
    //                 return User.where({id: resetToken.get('user_id')}).save({password: hash});
    //             }).then((user) => {
    //                 res.status(200);
    //                 res.send({
    //                     status: 'success',
    //                     user
    //                 });
    //             }).catch((error) => {
    //                 res.status(500);
    //                 res.send({
    //                     status: 'failure',
    //                     error
    //                 });
    //             });
    //     }).catch(() => {
    //         res.status(400);
    //         res.send({
    //             status: 'failure',
    //             error: 'Invalid reset token'
    //         });
    //     });
});
