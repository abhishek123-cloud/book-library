import Redis from 'ioredis';

const redis = new Redis({
  host: 'localhost', // Change this if your Redis server is on a different host
  port: 6379,        // Default Redis port
});

export default redis;