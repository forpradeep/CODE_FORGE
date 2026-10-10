const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { getLanguageById, executeTests, summarizeJudgeResults } = require('../utils/problemUtility');
const { publicError } = require('../utils/errors');
const Problem = require('../models/problem');
const User = require('../models/user');
const Submission = require('../models/submission');
const SolutionVideo = require('../models/solutionVideo');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const problemFields = (body) => ({
    title: body.title,
    description: body.description,
    difficulty: body.difficulty,
    tags: body.tags,
    visibleTestCases: body.visibleTestCases,
    hiddenTestCases: body.hiddenTestCases,
    startCode: body.startCode,
    referenceSolution: body.referenceSolution,
});

const assertReferenceSolutions = async (referenceSolution, visibleTestCases, hiddenTestCases) => {
    const cases = [...visibleTestCases, ...hiddenTestCases];
    for (const { language, completeCode } of referenceSolution) {
        const languageId = getLanguageById(language);
        const results = await executeTests(cases.map((testcase) => ({
            source_code: completeCode,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output,
        })));
        const summary = summarizeJudgeResults(results);
        if (summary.status !== 'accepted') {
            const err = new Error(`Reference solution for ${language} failed (${summary.status})`);
            err.status = 400;
            throw err;
        }
    }
};

const createProblem = async (req, res) => {
    try {
        await assertReferenceSolutions(
            req.body.referenceSolution,
            req.body.visibleTestCases,
            req.body.hiddenTestCases
        );

        await Problem.create({
            ...problemFields(req.body),
            problemCreator: req.result._id,
        });

        res.status(201).json({ message: 'Problem saved successfully' });
    } catch (err) {
        const parsed = publicError(err, 400);
        res.status(parsed.status).json({ message: parsed.message });
    }
};

const updateProblem = async (req, res) => {
    const { id } = req.params;
    try {
        if (!isValidId(id)) {
            return res.status(400).json({ message: 'Invalid problem id' });
        }

        const existing = await Problem.findById(id);
        if (!existing) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        await assertReferenceSolutions(
            req.body.referenceSolution,
            req.body.visibleTestCases,
            req.body.hiddenTestCases
        );

        const updated = await Problem.findByIdAndUpdate(
            id,
            { $set: problemFields(req.body) },
            { runValidators: true, new: true }
        );

        res.status(200).json(updated);
    } catch (err) {
        const parsed = publicError(err, 400);
        res.status(parsed.status).json({ message: parsed.message });
    }
};

const deleteProblem = async (req, res) => {
    const { id } = req.params;
    try {
        if (!isValidId(id)) {
            return res.status(400).json({ message: 'Invalid problem id' });
        }

        const deletedProblem = await Problem.findByIdAndDelete(id);
        if (!deletedProblem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        await Submission.deleteMany({ problemId: id });
        await User.updateMany({ problemSolved: id }, { $pull: { problemSolved: id } });

        const videos = await SolutionVideo.find({ problemId: id });
        for (const video of videos) {
            try {
                await cloudinary.uploader.destroy(video.cloudinaryPublicId, {
                    resource_type: 'video',
                    invalidate: true,
                });
            } catch (err) {
                console.error('Cloudinary delete failed:', err.message);
            }
        }
        await SolutionVideo.deleteMany({ problemId: id });

        res.status(200).json({ message: 'Successfully deleted' });
    } catch (err) {
        const parsed = publicError(err, 500);
        res.status(parsed.status).json({ message: parsed.message });
    }
};

const getProblemById = async (req, res) => {
    const { id } = req.params;
    try {
        if (!isValidId(id)) {
            return res.status(400).json({ message: 'Invalid problem id' });
        }

        const problem = await Problem.findById(id).select(
            '_id title description difficulty tags visibleTestCases startCode referenceSolution'
        );
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        const solved = (req.result.problemSolved || []).some(
            (solvedId) => String(solvedId) === String(problem._id)
        );

        const responseData = problem.toObject();
        if (!solved) {
            delete responseData.referenceSolution;
        }

        const videos = await SolutionVideo.findOne({ problemId: id });
        if (videos) {
            responseData.secureUrl = videos.secureUrl;
            responseData.thumbnailUrl = videos.thumbnailUrl;
            responseData.duration = videos.duration;
        }

        res.status(200).json(responseData);
    } catch (err) {
        const parsed = publicError(err, 500);
        res.status(parsed.status).json({ message: parsed.message });
    }
};

const getProblemByIdAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        if (!isValidId(id)) {
            return res.status(400).json({ message: 'Invalid problem id' });
        }

        const problem = await Problem.findById(id);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        res.status(200).json(problem);
    } catch (err) {
        const parsed = publicError(err, 500);
        res.status(parsed.status).json({ message: parsed.message });
    }
};

const getAllProblem = async (req, res) => {
    try {
        const problems = await Problem.find({}).select('_id title difficulty tags');
        res.status(200).json(problems);
    } catch (err) {
        const parsed = publicError(err, 500);
        res.status(parsed.status).json({ message: parsed.message });
    }
};

const solvedAllProblembyUser = async (req, res) => {
    try {
        const user = await User.findById(req.result._id).populate({
            path: 'problemSolved',
            select: '_id title difficulty tags',
        });
        res.status(200).json(user?.problemSolved || []);
    } catch (err) {
        const parsed = publicError(err, 500);
        res.status(parsed.status).json({ message: parsed.message });
    }
};

const submittedProblem = async (req, res) => {
    try {
        const problemId = req.params.pid;
        if (!isValidId(problemId)) {
            return res.status(400).json({ message: 'Invalid problem id' });
        }

        const submissions = await Submission.find({ userId: req.result._id, problemId })
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json(submissions);
    } catch (err) {
        const parsed = publicError(err, 500);
        res.status(parsed.status).json({ message: parsed.message });
    }
};

module.exports = {
    createProblem,
    updateProblem,
    deleteProblem,
    getProblemById,
    getProblemByIdAdmin,
    getAllProblem,
    solvedAllProblembyUser,
    submittedProblem,
};
