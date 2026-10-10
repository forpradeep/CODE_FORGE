const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

const userOrIp = (req) => (req.result ? req.result._id.toString() : ipKeyGenerator(req.ip));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts. Please try again in a few minutes.' },
});

const codeExecutionLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: userOrIp,
    message: { message: 'Too many run/submit requests. Please slow down and try again in a minute.' },
});

const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 8,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: userOrIp,
    message: { message: 'Too many AI requests. Please wait a minute and try again.' },
});

module.exports = { authLimiter, codeExecutionLimiter, aiLimiter };
