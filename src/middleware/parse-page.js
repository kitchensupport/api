export default function parsePage() {
    return function parser(req, res, next) {
        const limit = parseInt(req.query.limit);
        const offset = parseInt(req.query.offset);

        req.page = {
            limit: Number.isNaN(limit) ? 30 : limit,
            offset: Number.isNaN(offset) ? 0 : offset
        };

        next();
    };
};
