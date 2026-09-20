const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

// Run/Submit hit Judge0 (an external, quota-limited API), so these are capped
// per-user rather than relying on Express's default per-IP behavior alone.
// userMiddleware runs first on these routes, so req.result is already populated;
// the ipKeyGenerator fallback only matters if that ever changes.
const codeExecutionLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => (req.result ? req.result._id.toString() : ipKeyGenerator(req.ip)),
    message: { message: "Too many run/submit requests. Please slow down and try again in a minute." }
});

module.exports = { codeExecutionLimiter };