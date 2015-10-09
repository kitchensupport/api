import Log from '../models/log';

export default () => {
    return (req, res, next) => {
        new Log({
            ip: req.ip,
            method: req.method,
            requested: `${req.protocol}://${req.hostname}${req.path}`
        }).save().catch((err) => {
            console.log(`Error in middleware/logger.js: ${err}`);
            next();
        }).then(() => {
            next();
        });
    };
};
