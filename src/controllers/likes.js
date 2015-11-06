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

likes.get((req, res, next) => {
    User.where({id: req.user.id})
        .fetch({withRelated: ['likes']})
        .then((user) => {
            res.status(200).send({
                status: 'success',
                likes: user.related('likes').toJSON()
            });
        }).catch((err) => {
            console.error(err);
            res.status(403).send({
                status: 'failure',
                error: 'Unable to retrieve this user\'s likes'
            });

            next(new Error(`Unable to retrieve user ${req.user.id}'s likes`));
        });
});

likes.post((req, res, next) => {
    new Like({user_id: req.user.id, recipe_id: req.body.recipe_id})
        .save()
        .then(() => {
            res.status(200).send({
                status: 'success'
            });
        }).catch(() => {
            res.status(403).send({
                status: 'failure',
                error: 'Can not like this recipe'
            });

            next(new Error(`User ${req.user.id} can not like recipe ${req.body.recipe_id}`));
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
                status: 'failure',
                message: 'Unable to delete like'
            });

            next(err);
        });
});
