import express from 'express';
import uuid from 'uuid';
import request from 'request';
import User from '../models/user';

const router = express();

/**
 * a middleware for ensuring a valid token is included with the attaching route
 * @return {Function} - an express middleware to check for a valid token in the query parameter
 */
export function authorize() {
    return (req, res, next) => {
        const token = req.query.token;

        if (!token) {
            return next(new Error('Unauthorized'));
        }

        User.where('token', token).fetch().then((user) => {
            req.user = user;
            next();
        }).catch((error) => {
            next(error);
        });
    };
};
