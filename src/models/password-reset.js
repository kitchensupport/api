import uuid from 'node-uuid';
import bookshelf from '../utils/database';
import makeTable from '../utils/make-table';
import sendMail from '../utils/email';
import * as get from '../utils/get-models';

let User;

const Model = bookshelf.Model.extend({
    tableName: 'reset_password',
    initialize() {
        this.on('creating', (model) => {
            return new Model({user_id: model.get('user_id')}).fetch().then((rt) => {

                // TODO: if we have this existing reset token for the user,
                // can we just return this model rather than destroy it just to create a new one?
                if (rt) {
                    return rt.destroy();
                }
            });
        });

        this.on('created', (model) => {
            return model.fetch({withRelated: ['user']}).then((rt) => {
                return sendMail({
                    to: rt.related('user').get('email'),
                    subject: 'Reset your Kitchen Support password',
                    text: `Hey there, you seem to have requested a password reset. Click on the link below to enter your new password! Warning: the link is only active for 30 minutes from the time that this email is sent!\n\nhttp://kitchen.support/#/forgot-password/${model.get('reset_token')}\n\nIf this wasnt you, you can disregard this email.`
                });
            });
        });
    },
    user() {
        return this.belongsTo(User, 'user_id');
    }
}, {
    createFromEmail(email) {
        const resetToken = uuid.v4();

        return new User({email}).fetch({require: true}).then((user) => {
            return new Model({user_id: user.id, reset_token: resetToken}).save();
        });
    },
    confirm(token, newPassword) {
        return new Model({reset_token: token}).fetch({require: true, withRelated: ['user']}).then((rt) => {
            if (new Date() > new Date(rt.get('expire_date'))) {
                return rt.destroy().then(() => {
                    throw new Error('Invalid reset token');
                });
            }

            return rt.related('user').set('password', newPassword).save().then((user) => {
                return rt.destroy().then(() => {
                    return user;
                });
            });
        });
    }
});

export function register() {
    makeTable('reset_password', (schema) => {
        schema.increments('id').primary();
        schema.integer('user_id').unique();
        schema.string('reset_token').unique();
        schema.dateTime('expire_date').defaultTo(bookshelf.knex.raw('now() + INTERVAL \'30 minutes\''));
    });

    bookshelf.model('PasswordReset', Model);
};

export function load() {
    [User] = get.models('User');
};
