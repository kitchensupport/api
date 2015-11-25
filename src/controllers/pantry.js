import express from 'express';
import authorize from '../middleware/auth';
import * as get from '../utils/get-models';

const [Pantry] = get.collections('Pantry');
const [PantryItem] = get.models('PantryItem');
const router = express();

export function routes() {
    return router;
};

/* ********* route initialization ********* */

const pantry = router.route('/pantry');

pantry.all(authorize());

pantry.get((req, res, next) => {
    const {limit = 30, offset = 0} = req.query;

    Pantry.getByUserId(req.user.id).then((items) => {
        res.status(200).send(items.toJSON({
            status: 'success',
            limit,
            offset
        }));
    }).catch((err) => {
        res.status(403).send({
            status: 'failure',
            error: 'Unable to retrieve pantry'
        });

        next(err);
    });
});

pantry.post((req, res, next) => {
    PantryItem.upsert({
        userId: req.user.id,
        ingredientId: req.body.ingredient_id
    }).then(() => {
        res.status(200).send({
            status: 'success'
        });
    }).catch((err) => {
        res.status(403).send({
            status: 'failure',
            error: 'Can not add this ingredient to your pantry'
        });

        next(err);
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
    }).catch((err) => {
        res.status(403).send({
            status: 'failure',
            error: 'Can not remove this ingredient from the pantry'
        });

        next(err);
    });
});
