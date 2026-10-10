const mongoose = require('mongoose');
const Problem = require('../models/problem');
const Submission = require('../models/submission');
const User = require('../models/user');
const { getLanguageById, executeTests, summarizeJudgeResults, publicRunCase } = require('../utils/problemUtility');
const { validateTestSubmission } = require('./studentTest');

const MAX_CODE_CHARS = 100000;

const normalizeLanguage = (language) => {
    const value = String(language || '').toLowerCase();
    if (value === 'cpp' || value === 'c++') return 'c++';
    if (value === 'java') return 'java';
    if (value === 'javascript' || value === 'js') return 'javascript';
    return null;
};

const loadRunnableProblem = async (req, res) => {
    const userId = req.result._id;
    const problemId = req.params.id;
    const { code, language, testId } = req.body || {};

    if (!code || !problemId || !language) {
        res.status(400).json({ message: 'Some field missing' });
        return null;
    }
    if (typeof code !== 'string' || code.length > MAX_CODE_CHARS) {
        res.status(400).json({ message: 'Code is empty or too large' });
        return null;
    }
    if (!mongoose.Types.ObjectId.isValid(problemId)) {
        res.status(400).json({ message: 'Invalid problem id' });
        return null;
    }

    const normalized = normalizeLanguage(language);
    if (!normalized) {
        res.status(400).json({ message: 'Unsupported language' });
        return null;
    }

    if (testId) {
        if (!mongoose.Types.ObjectId.isValid(testId)) {
            res.status(400).json({ message: 'Invalid test id' });
            return null;
        }
        const check = await validateTestSubmission(testId, problemId, userId);
        if (!check.ok) {
            res.status(check.status).json({ message: check.message });
            return null;
        }
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
        res.status(404).json({ message: 'Problem not found' });
        return null;
    }

    return { userId, problemId, problem, code, language: normalized, testId: testId || null };
};

const submitCode = async (req, res, next) => {
    try {
        const loaded = await loadRunnableProblem(req, res);
        if (!loaded) return;

        const { userId, problemId, problem, code, language, testId } = loaded;
        const hidden = problem.hiddenTestCases || [];
        if (hidden.length === 0) {
            return res.status(400).json({ message: 'This problem has no hidden test cases' });
        }

        const submittedResult = await Submission.create({
            userId,
            problemId,
            testId,
            code,
            language,
            status: 'pending',
            testCasesTotal: hidden.length,
        });

        const languageId = getLanguageById(language);
        const results = await executeTests(hidden.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output,
        })));

        const summary = summarizeJudgeResults(results);
        submittedResult.status = summary.status;
        submittedResult.testCasesPassed = summary.testCasesPassed;
        submittedResult.errorMessage = summary.errorMessage || '';
        submittedResult.runtime = summary.runtime;
        submittedResult.memory = summary.memory;
        await submittedResult.save();

        if (!testId && summary.status === 'accepted') {
            await User.updateOne(
                { _id: userId },
                { $addToSet: { problemSolved: problem._id } }
            );
        }

        res.status(200).json({
            accepted: summary.status === 'accepted',
            totalTestCases: hidden.length,
            passedTestCases: summary.testCasesPassed,
            runtime: summary.runtime,
            memory: summary.memory,
            error: summary.status === 'accepted' ? null : (summary.errorMessage || 'Wrong answer'),
        });
    } catch (err) {
        return next(err);
    }
};

const runCode = async (req, res, next) => {
    try {
        const loaded = await loadRunnableProblem(req, res);
        if (!loaded) return;

        const { problem, code, language } = loaded;
        const visible = problem.visibleTestCases || [];
        if (visible.length === 0) {
            return res.status(400).json({ message: 'This problem has no visible test cases' });
        }

        const languageId = getLanguageById(language);
        const results = await executeTests(visible.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output,
        })));

        const summary = summarizeJudgeResults(results);
        res.status(200).json({
            success: summary.success,
            testCases: results.map(publicRunCase),
            runtime: summary.runtime,
            memory: summary.memory,
            error: summary.success ? null : summary.errorMessage,
        });
    } catch (err) {
        return next(err);
    }
};

module.exports = { submitCode, runCode };
