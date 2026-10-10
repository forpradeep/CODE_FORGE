const jwt = require('jsonwebtoken');

// 12 hours covers a class period and a timed test without a refresh-token flow.
const SESSION_MS = Number(process.env.SESSION_MS) || 12 * 60 * 60 * 1000;

function cookieOptions(overrides = {}) {
    const sameSite = process.env.COOKIE_SAMESITE || 'lax';
    const secure = process.env.COOKIE_SECURE
        ? process.env.COOKIE_SECURE === 'true'
        : process.env.NODE_ENV === 'production' || sameSite === 'none';

    return {
        httpOnly: true,
        secure,
        sameSite,
        path: '/',
        ...overrides,
    };
}

function setAuthCookie(res, token) {
    res.cookie('token', token, cookieOptions({ maxAge: SESSION_MS }));
}

function clearAuthCookie(res) {
    res.clearCookie('token', cookieOptions());
}

function signToken(user) {
    return jwt.sign(
        { _id: user._id, emailId: user.emailId, role: user.role },
        process.env.JWT_KEY,
        { expiresIn: Math.floor(SESSION_MS / 1000) }
    );
}

function publicUser(user) {
    return {
        firstName: user.firstName,
        emailId: user.emailId,
        _id: user._id,
        role: user.role,
        section: user.section || null,
    };
}

module.exports = { SESSION_MS, cookieOptions, setAuthCookie, clearAuthCookie, signToken, publicUser };
