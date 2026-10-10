const { publicError } = require('../utils/errors');

const notFoundHandler = (req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Must keep all four params so Express treats this as an error handler.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return;
    }

    const { status, message } = publicError(err);
    if (status >= 500) {
        console.error(err);
    }

    res.status(status).json({ message });
};

module.exports = { notFoundHandler, errorHandler };
