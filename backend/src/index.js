const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const main = require('./config/db');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/userAuth');
const redisClient = require('./config/redis');
const problemRouter = require('./routes/problemCreator');
const submitRouter = require('./routes/submit');
const aiRouter = require('./routes/aiChatting');
const videoRouter = require('./routes/videoCreator');
const sectionRouter = require('./routes/section');
const testRouter = require('./routes/test');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { sanitizeMongo } = require('./middleware/mongoSanitize');

const PLACEHOLDER_SECRETS = ['your_jwt_secret_key_here', 'change-me', 'not-for-production', 'replace-with'];

function assertEnv() {
    const missing = ['DB_CONNECT_STRING', 'JWT_KEY'].filter((key) => !process.env[key]);
    if (missing.length) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    if (process.env.NODE_ENV === 'production') {
        const secret = process.env.JWT_KEY;
        const looksPlaceholder = PLACEHOLDER_SECRETS.some((piece) => secret.includes(piece));
        if (secret.length < 32 || looksPlaceholder) {
            throw new Error('JWT_KEY must be a unique secret of at least 32 characters in production');
        }
    }
}

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

if (process.env.NODE_ENV !== 'production' && !allowedOrigins.includes('http://localhost:5173')) {
    allowedOrigins.push('http://localhost:5173');
}

if (process.env.TRUST_PROXY === '1' || process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(sanitizeMongo());
app.use(hpp());
app.use(cookieParser());

app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);
app.use('/ai', aiRouter);
app.use('/video', videoRouter);
app.use('/section', sectionRouter);
app.use('/test', testRouter);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/ready', (req, res) => {
    const mongoUp = mongoose.connection.readyState === 1;
    const redisUp = redisClient.isReady === true;
    const ok = mongoUp && redisUp;
    res.status(ok ? 200 : 503).json({
        status: ok ? 'ok' : 'not_ready',
        mongo: mongoUp,
        redis: redisUp,
        timestamp: new Date().toISOString(),
    });
});

app.use(notFoundHandler);
app.use(errorHandler);

const InitalizeConnection = async () => {
    try {
        assertEnv();
        await Promise.all([main(), redisClient.connect()]);
        console.log('DB connected');

        const port = process.env.PORT || 3000;
        const server = app.listen(port, '0.0.0.0', () => {
            console.log(`Server listening on port ${port}`);
        });

        const shutdown = (signal) => {
            console.log(`${signal} received, shutting down`);
            server.close(async () => {
                await mongoose.disconnect().catch(() => {});
                if (redisClient.isOpen) {
                    await redisClient.quit().catch(() => {});
                }
                process.exit(0);
            });
            setTimeout(() => process.exit(1), 10000).unref();
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    } catch (err) {
        console.error('Failed to start:', err.message);
        process.exit(1);
    }
};

if (require.main === module) {
    InitalizeConnection();
}

module.exports = app;
