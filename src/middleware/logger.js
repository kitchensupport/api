export default (message) => {
    return (req, res, next) => {
        console.log(`Logging ${message}`);
        next();
    };
};
