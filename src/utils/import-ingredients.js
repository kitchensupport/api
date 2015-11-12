import {get} from './yummly';
import {Collection as IngredientCollection} from '../models/ingredient';

function getYummlyIngredients() {
    console.log('Getting yummly ingredients');

    return get({
        path: '/metadata/ingredient',
        jsonp: true
    }).then((ingredients) => {
        console.log(`Yummly has ${ingredients.length} ingredients`);
        return ingredients;
    });
}

function getDbIngredients() {
    console.log('Getting ingredients from database');
    return new IngredientCollection().fetch().then((collection) => {
        console.log(`DB has ${collection.size()} ingredients`);
        return collection.toArray();
    });
}

function getDifference(values) {
    const existing = new Set();
    const inserts = [];

    console.log('Generating difference between ingredients');

    values[1].forEach((ingredient) => {
        existing.add(ingredient.get('searchValue'));
    });

    values[0].forEach((ingredient) => {
        if (!existing.has(ingredient.searchValue)) {
            inserts.push({searchValue: ingredient.searchValue, term: ingredient.term});
        }
    });

    return inserts;
}

Promise.all([getYummlyIngredients(), getDbIngredients()])
    .then(getDifference)
    .then((difference) => {
        const collection = new IngredientCollection(difference);

        console.log(`Saving ${collection.size()} new ingredients`);

        return collection.invokeThen('save').then(() => {
            return collection;
        });
    }).then((collection) => {
        console.log(`Saved ${collection.size()} new ingredients`);
        process.exit();
    }).catch((err) => {
        console.error('Unable to save new ingredients');
        console.error(err);
        process.exit();
    });
