const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redis');

// Role is taken from the database, not from the JWT. A demoted account
// must lose access immediately, even if an old token has not expired.
const authenticate = (allowedRoles) => async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        let payload;
        try {
            payload = jwt.verify(token, process.env.JWT_KEY);
        } catch {
            return res.status(401).json({ message: 'Invalid or expired session' });
        }

        if (!payload?._id) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        let blocked = 0;
        try {
            blocked = await redisClient.exists(`token:${token}`);
        } catch {
            return res.status(503).json({ message: 'Session store is unavailable' });
        }

        if (blocked) {
            return res.status(401).json({ message: 'Session has been revoked' });
        }

        const user = await User.findById(payload._id);
        if (!user) {
            return res.status(401).json({ message: "User doesn't exist" });
        }

        if (allowedRoles && !allowedRoles.includes(user.role)) {
            return res.status(403).json({ message: 'You do not have access to this resource' });
        }

        req.result = user;
        req.token = token;
        next();
    } catch {
        return res.status(401).json({ message: 'Authentication failed' });
    }
};

module.exports = authenticate;
