import uuid from 'uuid';
import bookshelf from '../utils/database';
import makeTable from '../utils/make-table';
import sendMail from '../utils/email';
import getModels from '../utils/get-models';

const [User] = getModels('User');

const Model = bookshelf.Model.extend({
    tableName: 'reset_password',
    initialize() {
        this.on('creating', (model, attrs) => {
            return Model.where({user_id: attrs.user_id}).fetch().then((rt) => {
                if (rt) {
                    return rt.destroy();
                }
            });
        });

        this.on('created', (model, attrs) => {
            return model.fetch({withRelated: ['user']}).then((rt) => {
                return sendMail({
                    to: rt.related('user').email,
                    subject: 'Reset your Kitchen Support password',
                    text: `Hey there, you seem to have requested a password reset. Click on the link below to enter your new password! Warning: the link is only active for 30 minutes from the time that this email is sent!\n\nhttp://kitchen.support/#/forgot-password/${attrs.token}\n\nIf this wasnt you, you can disregard this email.`
                });
            });
        });
    },
    user() {
        return this.belongsTo(bookshelf.model('User'));
    }
}, {
    createFromEmail(email) {
        const resetToken = uuid.v4();

        return User.where({email}).fetch({require: true}).then((user) => {
            return new Model({user_id: user.id, reset_token: resetToken}).save();
        });
    },
    confirm(token, newPassword) {
        return Model.where({reset_token: token}).fetch({require: true, withRelated: ['user']}).then((rt) => {
            if (new Date() > new Date(rt.get('expire_date'))) {
                return rt.destroy().then(() => {
                    throw new Error('Invalid reset token');
                });
            }

            return rt.related('user').save({password: newPassword}, {patch: true}).then((user) => {
                return rt.destroy.then(() => {
                    return user;
                });
            });
        });
    }
});

export default function initialize() {
    makeTable('reset_password', (schema) => {
        schema.increments('id').primary();
        schema.integer('user_id');
        schema.string('reset_token').unique();
        schema.dateTime('expire_date').defaultTo(bookshelf.knex.raw('now() + INTERVAL \'30 minutes\''));
    });

    bookshelf.model('PasswordReset', Model);
};
