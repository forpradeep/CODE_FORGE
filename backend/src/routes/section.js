const express = require('express');
const sectionRouter = express.Router();
const facultyMiddleware = require("../middleware/facultyMiddleware");
const userMiddleware = require("../middleware/userMiddleware");
const {
    createSection,
    getMySections,
    getSectionById,
    addStudents,
    removeStudent,
    deleteSection,
    updateSection,
    joinSectionByCode,
    getMyEnrolledSection
} = require("../controllers/section");

// Student routes (specific static routes before /:id)
sectionRouter.post("/join", userMiddleware, joinSectionByCode);
sectionRouter.get("/student/enrolled", userMiddleware, getMyEnrolledSection);

// Faculty routes
sectionRouter.post("/create", facultyMiddleware, createSection);
sectionRouter.get("/mine", facultyMiddleware, getMySections);
sectionRouter.get("/:id", facultyMiddleware, getSectionById);
sectionRouter.put("/:id", facultyMiddleware, updateSection);
sectionRouter.post("/:id/students", facultyMiddleware, addStudents);
sectionRouter.delete("/:id/students/:studentId", facultyMiddleware, removeStudent);
sectionRouter.delete("/:id", facultyMiddleware, deleteSection);

module.exports = sectionRouter;

