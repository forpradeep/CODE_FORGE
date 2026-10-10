const stripMongoKeys = (obj) => {
    if (obj === null || typeof obj !== 'object') return;

    for (const key of Object.keys(obj)) {
        if (key.startsWith('$') || key.includes('.')) {
            delete obj[key];
        } else if (typeof obj[key] === 'object') {
            stripMongoKeys(obj[key]);
        }
    }
};

const sanitizeMongo = () => (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        stripMongoKeys(req.body);
    }
    const queryObj = req.query;
    const safeQuery = {};
    for (const key of Object.keys(queryObj)) {
        if (key.startsWith('$') || key.includes('.')) {
            delete queryObj[key];
        } else {
            safeQuery[key] = queryObj[key];
        }
    }
    next();
};

module.exports = { sanitizeMongo, stripMongoKeys };
