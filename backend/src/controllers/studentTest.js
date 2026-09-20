const Test = require("../models/test");
const Attempt = require("../models/attempt");
const Submission = require("../models/submission");

// Auto-submits an in-progress attempt if its deadline has passed.
// Called at the top of every attempt-reading endpoint so expiry is caught
// on the next interaction rather than relying on a background job.
const enforceDeadline = async (attempt) => {
    if (attempt.status === 'in-progress' && new Date() > attempt.deadline) {
        attempt.status = 'auto-submitted';
        attempt.submittedAt = attempt.deadline;
        await attempt.save();
    }
    return attempt;
}

// Tests assigned to the logged-in student's section, with a computed
// status so the UI can show upcoming / active / ended without the client
// doing its own clock math.
const getMyTests = async (req, res) => {
    try {
        if (!req.result.section)
            return res.status(200).json([]);

        const tests = await Test.find({ section: req.result.section })
            .select('title startTime endTime durationMinutes')
            .sort({ startTime: 1 });

        const attempts = await Attempt.find({ student: req.result._id, test: { $in: tests.map(t => t._id) } });
        const attemptByTest = new Map(attempts.map(a => [String(a.test), a]));

        const now = new Date();
        const withStatus = tests.map(test => {
            const attempt = attemptByTest.get(String(test._id));
            let windowStatus;
            if (now < test.startTime) windowStatus = 'upcoming';
            else if (now > test.endTime) windowStatus = 'ended';
            else windowStatus = 'active';

            return {
                _id: test._id,
                title: test.title,
                startTime: test.startTime,
                endTime: test.endTime,
                durationMinutes: test.durationMinutes,
                windowStatus,
                attemptStatus: attempt ? attempt.status : 'not-started'
            };
        });

        res.status(200).json(withStatus);
    }
    catch (err) {
        res.status(500).json({ message: err.message || String(err) });
    }
}

const startAttempt = async (req, res) => {
    try {
        const { id } = req.params;
        const test = await Test.findById(id);

        if (!test)
            return res.status(404).json({ message: "Test not found" });

        if (!req.result.section || String(test.section) !== String(req.result.section))
            return res.status(403).json({ message: "This test is not assigned to your section" });

        const now = new Date();
        if (now < test.startTime)
            return res.status(403).json({ message: "This test has not opened yet" });
        if (now > test.endTime)
            return res.status(403).json({ message: "This test's window has closed" });

        let attempt = await Attempt.findOne({ test: id, student: req.result._id });

        if (attempt) {
            attempt = await enforceDeadline(attempt);
            if (attempt.status !== 'in-progress')
                return res.status(403).json({ message: "You have already submitted this test" });
            return res.status(200).json(attempt);
        }

        const deadline = new Date(Math.min(
            now.getTime() + test.durationMinutes * 60 * 1000,
            test.endTime.getTime()
        ));

        attempt = await Attempt.create({
            test: id,
            student: req.result._id,
            startedAt: now,
            deadline,
            status: 'in-progress'
        });

        res.status(201).json(attempt);
    }
    catch (err) {
        if (err.code === 11000)
            return res.status(409).json({ message: "Attempt already exists for this test" });
        res.status(500).json({ message: err.message || String(err) });
    }
}

const getAttempt = async (req, res) => {
    try {
        const { id } = req.params;
        let attempt = await Attempt.findOne({ test: id, student: req.result._id });

        if (!attempt)
            return res.status(404).json({ message: "You haven't started this test" });

        attempt = await enforceDeadline(attempt);

        const test = await Test.findById(id).populate('problems', 'title difficulty tags');

        const remainingSeconds = attempt.status === 'in-progress'
            ? Math.max(0, Math.floor((attempt.deadline.getTime() - Date.now()) / 1000))
            : 0;

        res.status(200).json({
            attempt,
            remainingSeconds,
            test: { _id: test._id, title: test.title, instructions: test.instructions, problems: test.problems }
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message || String(err) });
    }
}

const submitAttempt = async (req, res) => {
    try {
        const { id } = req.params;
        let attempt = await Attempt.findOne({ test: id, student: req.result._id });

        if (!attempt)
            return res.status(404).json({ message: "You haven't started this test" });

        attempt = await enforceDeadline(attempt);

        if (attempt.status !== 'in-progress')
            return res.status(200).json(attempt); // already submitted/auto-submitted — idempotent

        attempt.status = 'submitted';
        attempt.submittedAt = new Date();
        await attempt.save();

        res.status(200).json(attempt);
    }
    catch (err) {
        res.status(500).json({ message: err.message || String(err) });
    }
}

// Student views their own score + per-problem result after a test ends/is submitted.
const getMyResult = async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = req.result._id;

        const attempt = await Attempt.findOne({ test: id, student: studentId });
        if (!attempt)
            return res.status(404).json({ message: "You have no attempt for this test" });

        const test = await Test.findById(id).populate('problems', 'title difficulty tags');
        if (!test)
            return res.status(404).json({ message: "Test not found" });

        // Best (max testCasesPassed) submission per problem for this student in this test.
        const submissions = await Submission.find({ testId: id, userId: studentId });
        const bestByProblem = new Map();
        for (const sub of submissions) {
            const key = String(sub.problemId);
            const existing = bestByProblem.get(key);
            if (!existing || sub.testCasesPassed > existing.testCasesPassed) {
                bestByProblem.set(key, sub);
            }
        }

        const problemResults = test.problems.map(problem => {
            const best = bestByProblem.get(String(problem._id));
            return {
                problemId: problem._id,
                title: problem.title,
                difficulty: problem.difficulty,
                tags: problem.tags,
                attempted: !!best,
                accepted: best ? best.status === 'accepted' : false,
                testCasesPassed: best ? best.testCasesPassed : 0,
                testCasesTotal: best ? best.testCasesTotal : 0,
                language: best ? best.language : null,
                runtime: best ? best.runtime : null,
            };
        });

        const score = problemResults.filter(p => p.accepted).length;

        res.status(200).json({
            attempt: {
                status: attempt.status,
                startedAt: attempt.startedAt,
                submittedAt: attempt.submittedAt,
                deadline: attempt.deadline
            },
            test: { _id: test._id, title: test.title, instructions: test.instructions },
            problemResults,
            score,
            total: test.problems.length
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message || String(err) });
    }
}

module.exports = { getMyTests, startAttempt, getAttempt, submitAttempt, getMyResult, enforceDeadline, validateTestSubmission };

// Guard used by submitCode/runCode when a request includes a testId.
// Returns { ok: true } to proceed, or { ok: false, status, message } to reject.
// Left as a plain function (not middleware) since submitCode/runCode need
// the result inline alongside their existing manual field validation.
async function validateTestSubmission(testId, problemId, studentId) {
    const attempt = await Attempt.findOne({ test: testId, student: studentId });
    if (!attempt)
        return { ok: false, status: 403, message: "No active attempt for this test" };

    await enforceDeadline(attempt);

    if (attempt.status !== 'in-progress')
        return { ok: false, status: 403, message: "Your attempt for this test has ended" };

    const test = await Test.findById(testId);
    if (!test)
        return { ok: false, status: 404, message: "Test not found" };

    if (!test.problems.some(p => String(p) === String(problemId)))
        return { ok: false, status: 400, message: "This problem is not part of the test" };

    return { ok: true };
}
