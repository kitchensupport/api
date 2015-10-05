export default (message) => {
    return (req, res, next) => {
        console.log(`${req.ip},\t${req.method} ${req.protocol}://${req.hostname}${req.path}${message ? ",\t" + message : ""}`);
        //TODO: Store request inide a logging table in Postgresql.
        next();
    };
};
