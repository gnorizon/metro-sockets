const redis = require('redis');

// Load environment variables from .env file
require('dotenv').config();

const redisConfig = {
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
    },
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD || '',
};

const client = redis.createClient(redisConfig);

client.on('error', (err) => {
    console.error('Redis error:', err);
});

client.on('connect', () => {
    console.log('Connected to Redis');
});

// Async connection (since `createClient` in v4.x returns a promise)
(async () => {
    try {
        await client.connect();
        console.log('Successfully connected to Redis');
    } catch (err) {
        console.error('Connection to Redis failed:', err);
    }
})();

module.exports = client;
