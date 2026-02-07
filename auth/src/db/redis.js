const Redis = require("ioredis");

let redis;
if (process.env.NODE_ENV === 'test') {
  redis = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
  };
} else {
  redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
  });

  redis.on("connect", () => console.log("Connected to Redis 👍"));
  redis.on("error", (err) => console.error("Redis connection error:", err));
}

module.exports = redis;

