import express from 'express';
import authorize from '../middleware/auth';
import {Model as User} from '../models/user';
import Like from '../models/like';

const router = express();

export function routes() {
    return router;
};

/* ********* route initialization ********* */

router.use('/likes', authorize());
const likes = router.route('/likes');

likes.get((req, res) => {
    User.where({id: req.user.id})
        .fetch({withRelated: ['likes']})
        .then((user) => {
            console.log(user.related('likes'));
            res.status(200).send();
        });
});

likes.post((req, res, next) => {
    Like.where({user_id: req.user.id, recipe_id: req.body.recipe_id})
        .fetch()
        .then((like) => {
            if (like) {
                throw new Error('User has already liked this recipe');
            }
        }).then(() => {
            return new Like({user_id: req.user.id, recipe_id: req.body.recipe_id})
                .save();
        }).then(() => {
            res.status(200).send({
                status: 'success'
            });
        }).catch((err) => {
            res.status(400).send({
                status: 'failure',
                error: err.message
            });

            next(err);
        });
});

likes.delete((req, res, next) => {
    Like.where({user_id: req.user.id, recipe_id: req.body.recipe_id})
        .destroy()
        .then(() => {
            res.status(200).send({
                status: 'success'
            });
        }).catch((err) => {
            res.status(400).send({
                status: 'failure'
            });

            next(err);
        });
});
