import mailer from 'nodemailer';
import mandrill from 'nodemailer-mandrill-transport';
import {mandrillApiKey as apiKey, fromEmail} from '../../config/email';

const transport = mailer.createTransport(mandrill({
    auth: {apiKey}
}));

export default function send(params) {
    return new Promise((resolve, reject) => {
        transport.sendMail({
            from: fromEmail,
            to: params.to,
            replyto: 'donotreply@kitchen.support',
            subject: params.subject,
            text: params.text
        }, (err, info) => {
            if (err || info.rejected.length > 0) {
                return reject(err);
            }

            resolve(info);
        });
    });
};
