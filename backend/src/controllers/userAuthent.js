const redisClient = require("../config/redis");
const User =  require("../models/user")
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Submission = require("../models/submission")


const register = async (req,res)=>{
    
    try{
        // validate the data;

      validate(req.body); 
      const {firstName, emailId, password}  = req.body;

      req.body.password = await bcrypt.hash(password, 10);
      req.body.role = 'user'
    //
    
     const user =  await User.create(req.body);
     const token =  jwt.sign({_id:user._id , emailId:emailId, role:'user'},process.env.JWT_KEY,{expiresIn: 60*60});
     const reply = {
        firstName: user.firstName,
        emailId: user.emailId,
        _id: user._id,
        role:user.role,
    }
    
     res.cookie('token',token,{maxAge: 60*60*1000});
     res.status(201).json({
        user:reply,
        message:"Loggin Successfully"
    })
    }
    catch(err){
        res.status(400).json({message: err.message || String(err)});
    }
}


const login = async (req,res)=>{

    try{
        const {emailId, password} = req.body;

        if(!emailId)
            throw new Error("Invalid Credentials");
        if(!password)
            throw new Error("Invalid Credentials");

        const user = await User.findOne({emailId});

        if(!user)
            throw new Error("Invalid Credentials");

        const match = await bcrypt.compare(password,user.password);

        if(!match)
            throw new Error("Invalid Credentials");

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role:user.role,
        }

        const token =  jwt.sign({_id:user._id , emailId:emailId, role:user.role},process.env.JWT_KEY,{expiresIn: 60*60});
        res.cookie('token',token,{maxAge: 60*60*1000});
        res.status(201).json({
            user:reply,
            message:"Loggin Successfully"
        })
    }
    catch(err){
        res.status(401).json({message: err.message || String(err)});
    }
}


// logOut feature

const logout = async(req,res)=>{

    try{
        const {token} = req.cookies;
        const payload = jwt.decode(token);


        await redisClient.set(`token:${token}`,'Blocked');
        await redisClient.expireAt(`token:${token}`,payload.exp);
    //    Token add kar dung Redis ke blockList
    //    Cookies ko clear kar dena.....

    res.cookie("token",null,{expires: new Date(Date.now())});
    res.send("Logged Out Succesfully");

    }
    catch(err){
       res.status(503).json({message: err.message || String(err)});
    }
}


const adminRegister = async(req,res)=>{
    try{
        // validate the data;
      validate(req.body); 
      const {firstName, emailId, password}  = req.body;

      req.body.password = await bcrypt.hash(password, 10);
      req.body.role = 'admin';
    //
    
     await User.create(req.body);
     // Note: intentionally does NOT set a login cookie here — this is an
     // existing admin creating another admin's account, not that account
     // logging itself in. Setting the cookie would silently replace the
     // calling admin's session with the new account's.
     res.status(201).json({message: "Admin Registered Successfully"});
    }
    catch(err){
        res.status(400).json({message: err.message || String(err)});
    }
}

const facultyRegister = async(req,res)=>{
    try{
      validate(req.body);
      const {firstName, emailId, password}  = req.body;

      req.body.password = await bcrypt.hash(password, 10);
      req.body.role = 'faculty';

     await User.create(req.body);
     // Same reasoning as adminRegister: no session cookie for the caller here.
     res.status(201).json({message: "Faculty Registered Successfully"});
    }
    catch(err){
        res.status(400).json({message: err.message || String(err)});
    }
}

const deleteProfile = async(req,res)=>{
  
    try{
       const userId = req.result._id;
      
    // userSchema delete
    await User.findByIdAndDelete(userId);

    // Submission se bhi delete karo...
    
    // await Submission.deleteMany({userId});
    
    res.status(200).send("Deleted Successfully");

    }
    catch(err){
      
        res.status(500).json({message: err.message || "Internal Server Error"});
    }
}


const getProfile = async (req, res) => {
    try {
        const userId = req.result._id;

        const user = await User.findById(userId)
            .select('firstName lastName emailId role section createdAt')
            .populate('section', 'name code');

        // Solved problem stats
        const solvedProblems = await require('../models/problem').find(
            { _id: { $in: req.result.problemSolved } },
            '_id difficulty'
        );

        const stats = {
            total: solvedProblems.length,
            easy: solvedProblems.filter(p => p.difficulty?.toLowerCase() === 'easy').length,
            medium: solvedProblems.filter(p => p.difficulty?.toLowerCase() === 'medium').length,
            hard: solvedProblems.filter(p => p.difficulty?.toLowerCase() === 'hard').length,
        };

        // Last 10 submissions for activity
        const recentSubmissions = await Submission.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('problemId', 'title difficulty')
            .select('status language createdAt problemId testCasesPassed testCasesTotal');

        res.status(200).json({ user, stats, recentSubmissions });
    }
    catch (err) {
        res.status(500).json({ message: err.message || String(err) });
    }
}


module.exports = {register, login,logout,adminRegister,facultyRegister,deleteProfile,getProfile};