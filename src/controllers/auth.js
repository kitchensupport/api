import express from 'express';
import uuid from 'uuid';
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

/**
 * a helper function to create a new user
 * @param {Object} fields - an object containing an email and either a password or a facebook access token
 * @return {Promise} - a native ES6 promise that resolves on successful user creation and rejects otherwise
 */
function createUser(fields) {
    return new Promise((resolve, reject) => {
        const {email, password, facebookToken} = fields;
        const token = uuid.v4();

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

        new User({email, password, facebookToken, token})
            .save({method: 'insert'})
            .then((user) => {
                resolve(user);
            }).catch((error) => {
                reject(error);
            });
    });
}

/* ********* route initialization ********* */

router.post('/accounts/create/basic', (req, res) => {
    const {email, password} = req.body;

    createUser({email, password}).then((user) => {
        res.status(200);
        res.send({
            status: 'success',
            token: user.token
        });
    }).fail(() => {
        res.status(401);
        res.send({
            status: 'failure',
            message: 'Invalid username or password'
        });
    });
});

router.post('/accounts/create/facebook/:facebook_token', (req, res) => {
    const facebookToken = req.params.facebook_token;

    // hit facebook's api to make sure the token is valid, and get the user's email
    request({
        url: 'https://graph.facebook.com/me',
        qs: {
            access_token: facebookToken,
            fields: 'email'
        },
        json: true
    }, (facebookError, response) => {
        if (facebookError) {
            res.status(401);
            return res.send({
                status: 'failure',
                error: facebookError
            });
        }

        createUser({email: response.email, facebookToken}).then((user) => {
            res.status(200);
            res.send({
                status: 'success',
                token: user.token
            });
        }).fail((createUserError) => {
            res.status(401);
            res.send({
                status: 'failure',
                error: createUserError
            });
        });
    });
});

router.post('/accounts/login/basic', (req, res) => {
    const {email, password} = req.body;
    const hashedPassword = User.hashPassword(password);

    User.where({email, password: hashedPassword}).fetch().then((user) => {
        res.status(200);
        res.send({
            status: 'success',
            token: user.token
        });
    }).catch(() => {
        res.status(401);
        res.send({
            status: 'failure',
            error: 'Invalid username or password'
        });
    });
});

router.post('/accounts/login/facebook/:facebookToken', (req, res) => {
    const facebookToken = req.params.facebookToken;

    User.where('facebook_token', facebookToken).fetch().then((user) => {
        res.status(200);
        res.send({
            status: 'success',
            token: user.token
        });
    }).catch(() => {
        res.status(401);
        res.send({
            status: 'failure',
            error: 'Account does not exist'
        });
    });
});
