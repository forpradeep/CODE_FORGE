const Test = require("../models/test");
const Section = require("../models/section");
const Problem = require("../models/problem");
const Attempt = require("../models/attempt");
const Submission = require("../models/submission");

const ownsSectionOrAdmin = (req, section) =>
    req.result.role === 'admin' || String(section.createdBy) === String(req.result._id);

const createTest = async (req, res) => {
    try {
        const { title, instructions, section, problems, startTime, endTime, durationMinutes } = req.body;

        if (!title || !section || !problems || !startTime || !endTime || !durationMinutes)
            return res.status(400).json({ message: "title, section, problems, startTime, endTime and durationMinutes are required" });

        const sectionDoc = await Section.findById(section);
        if (!sectionDoc)
            return res.status(404).json({ message: "Section not found" });

        if (!ownsSectionOrAdmin(req, sectionDoc))
            return res.status(403).json({ message: "You don't own this section" });

        const problemCount = await Problem.countDocuments({ _id: { $in: problems } });
        if (problemCount !== problems.length)
            return res.status(400).json({ message: "One or more problem IDs are invalid" });

        const test = await Test.create({
            title,
            instructions,
            section,
            problems,
            createdBy: req.result._id,
            startTime,
            endTime,
            durationMinutes
        });

        res.status(201).json(test);
    }
    catch (err) {
        res.status(400).json({ message: err.message || String(err) });
    }
}

const getMyTests = async (req, res) => {
    try {
        const filter = req.result.role === 'admin' ? {} : { createdBy: req.result._id };
        const tests = await Test.find(filter)
            .select('title section startTime endTime durationMinutes createdAt')
            .populate('section', 'name code');
        res.status(200).json(tests);
    }
    catch (err) {
        res.status(500).json({ message: err.message || String(err) });
    }
}

const getTestById = async (req, res) => {
    try {
        const { id } = req.params;
        const test = await Test.findById(id)
            .populate('section', 'name code students')
            .populate('problems', 'title difficulty tags');

        if (!test)
            return res.status(404).json({ message: "Test not found" });

        if (req.result.role !== 'admin' && String(test.createdBy) !== String(req.result._id))
            return res.status(403).json({ message: "You don't own this test" });

        res.status(200).json(test);
    }
    catch (err) {
        res.status(500).json({ message: err.message || String(err) });
    }
}

const deleteTest = async (req, res) => {
    try {
        const { id } = req.params;
        const test = await Test.findById(id);

        if (!test)
            return res.status(404).json({ message: "Test not found" });

        if (req.result.role !== 'admin' && String(test.createdBy) !== String(req.result._id))
            return res.status(403).json({ message: "You don't own this test" });

        await Attempt.deleteMany({ test: id });
        await Test.findByIdAndDelete(id);

        res.status(200).json({ message: "Test deleted" });
    }
    catch (err) {
        res.status(500).json({ message: err.message || String(err) });
    }
}

// Faculty results dashboard for one test: every student in the section,
// their attempt status, and per-problem pass/fail using their BEST
// (highest testCasesPassed) submission made under this testId.
const getTestResults = async (req, res) => {
    try {
        const { id } = req.params;
        const test = await Test.findById(id).populate('section', 'name code students').populate('problems', 'title');

        if (!test)
            return res.status(404).json({ message: "Test not found" });

        if (req.result.role !== 'admin' && String(test.createdBy) !== String(req.result._id))
            return res.status(403).json({ message: "You don't own this test" });

        const attempts = await Attempt.find({ test: id }).populate('student', 'firstName lastName emailId');
        const attemptByStudent = new Map(attempts.map(a => [String(a.student._id), a]));

        const submissions = await Submission.find({ testId: id });

        // Best (max testCasesPassed) submission per student per problem.
        const bestByStudentProblem = new Map();
        for (const sub of submissions) {
            const key = `${sub.userId}:${sub.problemId}`;
            const existing = bestByStudentProblem.get(key);
            if (!existing || sub.testCasesPassed > existing.testCasesPassed) {
                bestByStudentProblem.set(key, sub);
            }
        }

        const results = test.section.students.map(student => {
            const attempt = attemptByStudent.get(String(student._id));
            const problemResults = test.problems.map(problem => {
                const best = bestByStudentProblem.get(`${student._id}:${problem._id}`);
                return {
                    problemId: problem._id,
                    title: problem.title,
                    attempted: !!best,
                    accepted: best ? best.status === 'accepted' : false,
                    testCasesPassed: best ? best.testCasesPassed : 0,
                    testCasesTotal: best ? best.testCasesTotal : 0
                };
            });

            return {
                student: { _id: student._id, firstName: student.firstName, lastName: student.lastName, emailId: student.emailId },
                attemptStatus: attempt ? attempt.status : 'not-started',
                startedAt: attempt ? attempt.startedAt : null,
                submittedAt: attempt ? attempt.submittedAt : null,
                problems: problemResults,
                score: problemResults.filter(p => p.accepted).length
            };
        });

        res.status(200).json({ test: { _id: test._id, title: test.title, problems: test.problems }, results });
    }
    catch (err) {
        res.status(500).json({ message: err.message || String(err) });
    }
}

module.exports = { createTest, getMyTests, getTestById, deleteTest, getTestResults };
