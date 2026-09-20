const express = require('express');
const testRouter = express.Router();
const facultyMiddleware = require("../middleware/facultyMiddleware");
const userMiddleware = require("../middleware/userMiddleware");

const { createTest, getMyTests, getTestById, deleteTest, getTestResults } = require("../controllers/test");
const { getMyTests: getMyAssignedTests, startAttempt, getAttempt, submitAttempt, getMyResult } = require("../controllers/studentTest");


// -- Faculty (static paths first) --
testRouter.post("/create", facultyMiddleware, createTest);
testRouter.get("/mine", facultyMiddleware, getMyTests);

// -- Student (static /student/mine MUST be registered before the generic
// /:id route below, or Express matches "student" as the :id param and
// this route becomes unreachable) --
testRouter.get("/student/mine", userMiddleware, getMyAssignedTests);
testRouter.post("/:id/start", userMiddleware, startAttempt);
testRouter.get("/:id/attempt", userMiddleware, getAttempt);
testRouter.post("/:id/submit", userMiddleware, submitAttempt);
testRouter.get("/:id/my-result", userMiddleware, getMyResult);

// -- Faculty (generic /:id — must come after the more specific paths above) --
testRouter.get("/:id", facultyMiddleware, getTestById);
testRouter.delete("/:id", facultyMiddleware, deleteTest);
testRouter.get("/:id/results", facultyMiddleware, getTestResults);

module.exports = testRouter;
