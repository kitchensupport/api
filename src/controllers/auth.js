import express from 'express';
import * as get from '../utils/get-models';
import authorize from '../middleware/auth';

const router = express();
const [User, PasswordResetToken] = get.models('User', 'PasswordReset');

/**
 * a middleware that lets the root server use all of the login routes
 * sets up nodemailer for use by the module later
 * @return {ExpressApplication} - an express application with registered routes
 */
export function routes() {
    return router;
};

/* ********* route initialization ********* */

router.post('/accounts/create', (req, res, next) => {
    const {email, password} = req.body;

    new User({
        email,
        password
    }).save().then((user) => {
        res.status(200).send(user.toJSON({status: 'success'}));
    }).catch(() => {
        res.status(400).send({
            status: 'failure',
            error: 'Could not create account'
        });

        next(new Error('Could not create account'));
    });
});

router.post('/accounts/login', (req, res, next) => {
    const {email, password} = req.body;

    User.login({
        email,
        password
    }).then((user) => {
        res.status(200).send(user.toJSON({status: 'success'}));
    }).catch((err) => {
        res.status(400).send({
            status: 'failure',
            error: err.message
        });

        next(err);
    });
});

router.get('/account', authorize(), (req, res) => {
    res.status(200).send(Object.assign({}, req.user, {status: 'success'}));
});

router.post('/accounts/reset/request', (req, res, next) => {
    const {email} = req.body;

    PasswordResetToken.createFromEmail(email).then(() => {
        res.status(200).send({status: 'success'});
    }).catch((err) => {
        res.status(500).send({status: 'failure'});
        next(err);
    });
});

router.post('/accounts/reset/confirm', (req, res, next) => {
    const {reset_token, password} = req.body;

    PasswordResetToken.confirm(reset_token, password).then(() => {
        res.status(200).send({status: 'success'});
    }).catch((err) => {
        res.status(500).send({status: 'failure'});
        next(err);
    });
});
