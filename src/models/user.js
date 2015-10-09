import bookshelf from '../utils/database';
import model from '../utils/model';

model('users', (schema) => {
    schema.increments('id').primary();
    schema.string('email').unique();
    schema.string('password');
    schema.string('facebookToken').unique();
    schema.string('token').unique();
    schema.timestamps();
});

export default bookshelf.Model.extend({
    tableName: 'users'
});
