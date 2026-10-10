const express = require('express');
const aiRouter =  express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const { aiLimiter } = require("../middleware/rateLimiter");
const solveDoubt = require('../controllers/solveDoubt');

aiRouter.post('/chat', userMiddleware, aiLimiter, solveDoubt);

module.exports = aiRouter;