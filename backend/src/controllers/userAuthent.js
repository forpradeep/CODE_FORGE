const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const redisClient = require('../config/redis');
const User = require('../models/user');
const Submission = require('../models/submission');
const Section = require('../models/section');
const Attempt = require('../models/attempt');
const Problem = require('../models/problem');
const validate = require('../utils/validator');
const { publicError } = require('../utils/errors');
const { setAuthCookie, clearAuthCookie, signToken, publicUser } = require('../utils/session');

const register = async (req, res) => {
    try {
        validate(req.body);
        const { firstName, emailId, password } = req.body;

        const user = await User.create({
            firstName: String(firstName).trim(),
            emailId: String(emailId).trim().toLowerCase(),
            password: await bcrypt.hash(password, 10),
            role: 'user',
        });

        setAuthCookie(res, signToken(user));
        res.status(201).json({
            user: publicUser(user),
            message: 'Registered successfully',
        });
    } catch (err) {
        const parsed = publicError(err, 400);
        res.status(parsed.status).json({ message: parsed.message });
    }
};

const login = async (req, res) => {
    try {
        const emailId = String(req.body?.emailId || '').trim().toLowerCase();
        const password = req.body?.password;

        if (!emailId || !password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = await User.findOne({ emailId }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        setAuthCookie(res, signToken(user));
        res.status(200).json({
            user: publicUser(user),
            message: 'Logged in successfully',
        });
    } catch (err) {
        const parsed = publicError(err, 500);
        res.status(parsed.status).json({ message: parsed.message });
    }
};

const logout = async (req, res) => {
    const token = req.cookies?.token;
    clearAuthCookie(res);

    try {
        if (token) {
            const payload = jwt.decode(token);
            await redisClient.set(`token:${token}`, 'Blocked');
            if (payload?.exp) {
                await redisClient.expireAt(`token:${token}`, payload.exp);
            } else {
                await redisClient.expire(`token:${token}`, 60 * 60 * 12);
            }
        }
    } catch (err) {
        console.error('Failed to revoke session:', err.message);
    }

    res.status(200).json({ message: 'Logged out successfully' });
};

const createStaffAccount = async (req, res, role) => {
    try {
        validate(req.body);
        const { firstName, emailId, password } = req.body;

        await User.create({
            firstName: String(firstName).trim(),
            emailId: String(emailId).trim().toLowerCase(),
            password: await bcrypt.hash(password, 10),
            role,
        });

        res.status(201).json({ message: `${role === 'admin' ? 'Admin' : 'Faculty'} registered successfully` });
    } catch (err) {
        const parsed = publicError(err, 400);
        res.status(parsed.status).json({ message: parsed.message });
    }
};

const adminRegister = (req, res) => createStaffAccount(req, res, 'admin');
const facultyRegister = (req, res) => createStaffAccount(req, res, 'faculty');

const deleteProfile = async (req, res) => {
    try {
        const userId = req.result._id;

        if (req.result.role === 'admin') {
            return res.status(403).json({ message: 'Admin accounts cannot be self-deleted' });
        }

        await Submission.deleteMany({ userId });
        await Attempt.deleteMany({ student: userId });
        await Section.updateMany({ students: userId }, { $pull: { students: userId } });
        await User.findByIdAndDelete(userId);

        clearAuthCookie(res);
        if (req.token) {
            await redisClient.set(`token:${req.token}`, 'Blocked').catch(() => {});
        }

        res.status(200).json({ message: 'Deleted successfully' });
    } catch (err) {
        const parsed = publicError(err, 500);
        res.status(parsed.status).json({ message: parsed.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.result._id;

        const user = await User.findById(userId)
            .select('firstName lastName emailId role section createdAt')
            .populate('section', 'name code');

        const solvedProblems = await Problem.find(
            { _id: { $in: req.result.problemSolved || [] } },
            '_id difficulty'
        );

        const stats = {
            total: solvedProblems.length,
            easy: solvedProblems.filter((problem) => problem.difficulty === 'easy').length,
            medium: solvedProblems.filter((problem) => problem.difficulty === 'medium').length,
            hard: solvedProblems.filter((problem) => problem.difficulty === 'hard').length,
        };

        const recentSubmissions = await Submission.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('problemId', 'title difficulty')
            .select('status language createdAt problemId testCasesPassed testCasesTotal');

        res.status(200).json({ user, stats, recentSubmissions });
    } catch (err) {
        const parsed = publicError(err, 500);
        res.status(parsed.status).json({ message: parsed.message });
    }
};

module.exports = { register, login, logout, adminRegister, facultyRegister, deleteProfile, getProfile };
