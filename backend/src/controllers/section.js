const Section = require("../models/section");
const User = require("../models/user");
const Test = require("../models/test");

const createSection = async (req, res) => {
    try {
        const { name, code } = req.body;

        if (!name || !code)
            return res.status(400).json({ message: "name and code are required" });

        const section = await Section.create({
            name: name.trim(),
            code: code.trim().toUpperCase(),
            createdBy: req.result._id,
            students: []
        });

        res.status(201).json(section);
    }
    catch (err) {
        if (err.code === 11000)
            return res.status(409).json({ message: "A section with this code already exists" });
        res.status(400).json({ message: err.message || String(err) });
    }
}

// Faculty see only sections they created; admin sees every section.
const getMySections = async (req, res) => {
    try {
        const filter = req.result.role === 'admin' ? {} : { createdBy: req.result._id };
        const sections = await Section.find(filter).select('name code students createdAt');

        // Fetch test counts for these sections
        const sectionIds = sections.map(s => s._id);
        const testCounts = await Test.aggregate([
            { $match: { section: { $in: sectionIds } } },
            { $group: { _id: '$section', count: { $sum: 1 } } }
        ]);
        const testCountMap = new Map(testCounts.map(tc => [String(tc._id), tc.count]));

        const result = sections.map(s => ({
            _id: s._id,
            name: s.name,
            code: s.code,
            students: s.students,
            createdAt: s.createdAt,
            studentCount: s.students?.length || 0,
            testCount: testCountMap.get(String(s._id)) || 0
        }));

        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json({ message: err.message || String(err) });
    }
}

const getSectionById = async (req, res) => {
    try {
        const { id } = req.params;
        const section = await Section.findById(id).populate('students', 'firstName lastName emailId');

        if (!section)
            return res.status(404).json({ message: "Section not found" });

        if (req.result.role !== 'admin' && String(section.createdBy) !== String(req.result._id))
            return res.status(403).json({ message: "You don't own this section" });

        res.status(200).json(section);
    }
    catch (err) {
        res.status(500).json({ message: err.message || String(err) });
    }
}

// Bulk-adds existing student accounts (role: 'user') to a section by email.
// Students must already have an account (via the normal signup flow) —
// this does not create accounts, it just rosters them into a class.
const addStudents = async (req, res) => {
    try {
        const { id } = req.params;
        const { emails } = req.body;

        if (!Array.isArray(emails) || emails.length === 0)
            return res.status(400).json({ message: "emails must be a non-empty array" });

        const section = await Section.findById(id);
        if (!section)
            return res.status(404).json({ message: "Section not found" });

        if (req.result.role !== 'admin' && String(section.createdBy) !== String(req.result._id))
            return res.status(403).json({ message: "You don't own this section" });

        const normalizedEmails = emails.map(e => String(e).trim().toLowerCase()).filter(Boolean);

        const students = await User.find({ emailId: { $in: normalizedEmails }, role: 'user' });

        const foundEmails = students.map(s => s.emailId);
        const notFound = normalizedEmails.filter(e => !foundEmails.includes(e));

        const existingIds = new Set(section.students.map(s => String(s)));
        const newStudentIds = students.map(s => s._id).filter(id => !existingIds.has(String(id)));

        section.students.push(...newStudentIds);
        await section.save();

        // Point each newly-added student's user record at this section.
        await User.updateMany(
            { _id: { $in: newStudentIds } },
            { $set: { section: section._id } }
        );

        res.status(200).json({
            added: newStudentIds.length,
            alreadyInSection: students.length - newStudentIds.length,
            notFound
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message || String(err) });
    }
}

const removeStudent = async (req, res) => {
    try {
        const { id, studentId } = req.params;

        const section = await Section.findById(id);
        if (!section)
            return res.status(404).json({ message: "Section not found" });

        if (req.result.role !== 'admin' && String(section.createdBy) !== String(req.result._id))
            return res.status(403).json({ message: "You don't own this section" });

        section.students = section.students.filter(s => String(s) !== String(studentId));
        await section.save();

        await User.updateOne(
            { _id: studentId, section: section._id },
            { $set: { section: null } }
        );

        res.status(200).json({ message: "Student removed from section" });
    }
    catch (err) {
        res.status(500).json({ message: err.message || String(err) });
    }
}

const deleteSection = async (req, res) => {
    try {
        const { id } = req.params;

        const section = await Section.findById(id);
        if (!section)
            return res.status(404).json({ message: "Section not found" });

        if (req.result.role !== 'admin' && String(section.createdBy) !== String(req.result._id))
            return res.status(403).json({ message: "You don't own this section" });

        await User.updateMany(
            { section: section._id },
            { $set: { section: null } }
        );

        await Section.findByIdAndDelete(id);

        res.status(200).json({ message: "Section deleted" });
    }
    catch (err) {
        res.status(500).json({ message: err.message || String(err) });
    }
}

const updateSection = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code } = req.body;

        const section = await Section.findById(id);
        if (!section)
            return res.status(404).json({ message: "Section not found" });

        if (req.result.role !== 'admin' && String(section.createdBy) !== String(req.result._id))
            return res.status(403).json({ message: "You don't own this section" });

        if (name) section.name = name.trim();
        if (code) section.code = code.trim().toUpperCase();

        await section.save();
        res.status(200).json(section);
    }
    catch (err) {
        if (err.code === 11000)
            return res.status(409).json({ message: "A section with this code already exists" });
        res.status(400).json({ message: err.message || String(err) });
    }
};

const joinSectionByCode = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code)
            return res.status(400).json({ message: "Section code is required" });

        const trimmedCode = code.trim().toUpperCase();
        const section = await Section.findOne({ 
            code: { $regex: new RegExp(`^${trimmedCode}$`, 'i') } 
        });

        if (!section)
            return res.status(404).json({ message: "Invalid section code. No matching section found." });

        const studentId = req.result._id;

        // If already in this section
        if (section.students.some(s => String(s) === String(studentId))) {
            return res.status(200).json({ message: "You are already enrolled in this section", section });
        }

        // If currently in another section, remove from old section first
        if (req.result.section && String(req.result.section) !== String(section._id)) {
            await Section.updateOne(
                { _id: req.result.section },
                { $pull: { students: studentId } }
            );
        }

        // Add to new section
        section.students.push(studentId);
        await section.save();

        // Update user's section reference
        await User.findByIdAndUpdate(studentId, { section: section._id });

        res.status(200).json({
            message: `Successfully enrolled in ${section.name} (${section.code})`,
            section: {
                _id: section._id,
                name: section.name,
                code: section.code
            }
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message || String(err) });
    }
};

const getMyEnrolledSection = async (req, res) => {
    try {
        if (!req.result.section) {
            return res.status(200).json(null);
        }
        const section = await Section.findById(req.result.section)
            .select('name code createdBy createdAt')
            .populate('createdBy', 'firstName lastName emailId');

        res.status(200).json(section);
    } catch (err) {
        res.status(500).json({ message: err.message || String(err) });
    }
};

module.exports = { 
    createSection, 
    getMySections, 
    getSectionById, 
    addStudents, 
    removeStudent, 
    deleteSection,
    updateSection,
    joinSectionByCode,
    getMyEnrolledSection
};
