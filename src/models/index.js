import * as ingredient from './ingredient';
import * as pantry from './pantry';
import * as passwordReset from './password-reset';
import * as recipe from './recipe';
import * as userRecipe from './user-recipe';
import * as user from './user';

const models = [ingredient, pantry, passwordReset, recipe, userRecipe, user];

models.forEach((model) => {
    model.register();
});

models.forEach((model) => {
    model.load();
});
