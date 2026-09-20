// Catches any request that didn't match a route above it.
const notFoundHandler = (req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Final safety net. Every controller already catches its own errors and
// responds with JSON, so this only fires for things that slip past that —
// errors thrown in middleware, programmer errors, or routes added later
// that forget a try/catch. Must be registered last, after all app.use()
// route mounts, and must keep all four params for Express to treat it as
// an error handler.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    console.error(err);

    if (res.headersSent) {
        return;
    }

    const status = err.status || err.statusCode || 500;
    res.status(status).json({
        message: err.message || "Internal server error"
    });
};

module.exports = { notFoundHandler, errorHandler };
