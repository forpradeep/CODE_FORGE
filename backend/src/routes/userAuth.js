const express = require('express');

const authRouter =  express.Router();
const {register, login,logout, adminRegister,facultyRegister,deleteProfile,getProfile} = require('../controllers/userAuthent')
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require('../middleware/adminMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Register
authRouter.post('/register', authLimiter, register);
authRouter.post('/login', authLimiter, login);
authRouter.post('/logout', userMiddleware, logout);
authRouter.post('/admin/register', adminMiddleware ,adminRegister);
authRouter.post('/faculty/register', adminMiddleware ,facultyRegister);
authRouter.delete('/deleteProfile',userMiddleware,deleteProfile);
authRouter.get('/check',userMiddleware,(req,res)=>{

    const reply = {
        firstName: req.result.firstName,
        emailId: req.result.emailId,
        _id:req.result._id,
        role:req.result.role,
        section:req.result.section,
    }

    res.status(200).json({
        user:reply,
        message:"Valid User"
    });
})
authRouter.get('/profile', userMiddleware, getProfile);


module.exports = authRouter;

// login
// logout
// GetProfile

