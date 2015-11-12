import express from 'express';
import authorize from '../middleware/auth';
import {Collection as Pantry, Model as PantryItem} from '../models/pantry';

const router = express();

export function routes() {
    return router;
};

export function getPantry({id}) {
    return new Pantry().query((query) => {
        query.where({user_id: id, active: true}).orderBy('id');
    }).fetch({withRelated: ['ingredient']});
};

export function newPantryItem({userId, ingredientId}) {
    return PantryItem.where({
        user_id: userId,
        ingredient_id: ingredientId
    }).fetch().then((item) => {
        if (item) {
            return item.save({active: true}, {patch: true});
        }

        return new PantryItem({
            user_id: userId,
            ingredient_id: ingredientId
        }).save();
    });
};

/* ********* route initialization ********* */

const pantry = router.route('/pantry');

pantry.all(authorize());

pantry.get((req, res, next) => {
    const {limit = 30, offset = 0} = req.query;

    getPantry({id: req.user.id}).then((items) => {
        res.status(200).send(items.toJSON({
            status: 'success',
            limit,
            offset
        }));
    }).catch((err) => {
        console.error(err);
        res.status(403).send({
            status: 'failure',
            error: 'Unable to retrieve pantry'
        });

        next(new Error(`Unable to load pantry for user ${req.user.id}`));
    });
});

pantry.post((req, res, next) => {
    newPantryItem({
        userId: req.user.id,
        ingredientId: req.body.ingredient_id
    }).then(() => {
        res.status(200).send({
            status: 'success'
        });
    }).catch(() => {
        res.status(403).send({
            status: 'failure',
            error: 'Can not add this ingredient to your pantry'
        });

        next(new Error(`User ${req.user.id} can not add ingredient ${req.body.ingredient_id} to their pantry`));
    });
});

pantry.delete((req, res, next) => {
    PantryItem.where({
        user_id: req.user.id,
        ingredient_id: req.body.ingredient_id
    }).save({active: false}, {patch: true, method: 'update', require: true}).then(() => {
        res.status(200).send({
            status: 'success'
        });
    }).catch(() => {
        res.status(403).send({
            status: 'failure',
            error: 'Can not remove this ingredient from the pantry'
        });

        next(new Error(`User ${req.user.id} can not remove ingredient ${req.body.ingredient_id} from their pantry`));
    });
});
