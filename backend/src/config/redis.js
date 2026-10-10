const { createClient } = require('redis');

function buildRedisOptions() {
    if (process.env.REDIS_URL) {
        return { url: process.env.REDIS_URL };
    }

    const options = {
        socket: {
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: Number(process.env.REDIS_PORT) || 6379,
            reconnectStrategy: (retries) => Math.min(retries * 200, 2000),
        },
    };

    if (process.env.REDIS_PASS) {
        options.username = process.env.REDIS_USERNAME || 'default';
        options.password = process.env.REDIS_PASS;
    }

    return options;
}

const redisClient = createClient(buildRedisOptions());

redisClient.on('error', (err) => {
    console.error('Redis error:', err.message);
});

module.exports = redisClient;
