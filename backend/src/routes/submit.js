const express = require('express');
const submitRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const { codeExecutionLimiter } = require("../middleware/rateLimiter");
const {submitCode,runCode} = require("../controllers/userSubmission");

submitRouter.post("/submit/:id", userMiddleware, codeExecutionLimiter, submitCode);
submitRouter.post("/run/:id", userMiddleware, codeExecutionLimiter, runCode);

module.exports = submitRouter;