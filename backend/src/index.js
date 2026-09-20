const express = require('express')
const app = express();
require('dotenv').config();
const main =  require('./config/db')
const cookieParser =  require('cookie-parser');
const authRouter = require("./routes/userAuth");
const redisClient = require('./config/redis');
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit")
const aiRouter = require("./routes/aiChatting")
const videoRouter = require("./routes/videoCreator");
const sectionRouter = require("./routes/section");
const testRouter = require("./routes/test");
const cors = require('cors')
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// console.log("Hello")

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true 
}))

app.use(express.json());
app.use(cookieParser());

app.use('/user',authRouter);
app.use('/problem',problemRouter);
app.use('/submission',submitRouter);
app.use('/ai',aiRouter);
app.use("/video",videoRouter);
app.use("/section",sectionRouter);
app.use("/test",testRouter);

// Must come after all routes: 404 for anything unmatched, then the
// error handler as the final safety net (see middleware/errorHandler.js).
app.use(notFoundHandler);
app.use(errorHandler);

const InitalizeConnection = async ()=>{
    try{

        await Promise.all([main(),redisClient.connect()]);
        console.log("DB Connected");
        
        app.listen(process.env.PORT, ()=>{
            console.log("Server listening at port number: "+ process.env.PORT);
        })

    }
    catch(err){
        console.log("Error: "+err);
    }
}


InitalizeConnection();

