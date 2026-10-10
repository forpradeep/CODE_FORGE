function publicError(err, fallbackStatus = 500) {
    if (err?.code === 11000) {
        return { status: 409, message: 'A record with that value already exists' };
    }
    if (err?.name === 'ValidationError') {
        return { status: 400, message: err.message };
    }
    if (err?.name === 'CastError') {
        return { status: 400, message: 'Invalid id' };
    }

    const status = err?.status || err?.statusCode || fallbackStatus;
    // Intentional statuses (502 from the code runner, 503 when a service
    // is not configured) keep their message. Unexpected 500s do not.
    const intentional = Boolean(err?.status || err?.statusCode);
    const hideDetails = status >= 500 && process.env.NODE_ENV === 'production' && !intentional;
    return {
        status,
        message: hideDetails ? 'Internal server error' : (err?.message || 'Internal server error'),
    };
}

module.exports = { publicError };
