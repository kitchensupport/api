import mailer from 'nodemailer';
import sendgrid from 'nodemailer-sendgrid-transport';
import {sendgridApiKey as apiKey, fromEmail} from '../../config/email';

const transport = mailer.createTransport(sendgrid({
    auth: {
        api_key: apiKey
    }
}));

export default function send(params) {
    return new Promise((resolve, reject) => {
        transport.sendMail({
            from: fromEmail,
            to: params.to,
            replyto: 'donotreply@kitchen.support',
            subject: params.subject,
            text: params.text
        }, (err, response) => {
            if (err) {
                return reject(err);
            }

            resolve(response);
        });
    });
};
