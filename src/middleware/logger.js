import Log from '../models/log';

export default (message) => {
    return (req, res, next) => {
        console.log(`Logging ${message}`);
        new Log({
            ip: req.ip,
            method: req.method,
            requested: `${req.protocol}://${req.hostname}${req.path}`
        }).save();
        next();
    };
};
