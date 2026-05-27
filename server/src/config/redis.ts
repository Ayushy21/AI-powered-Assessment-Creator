import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);

// Singleton Redis connection
// Use REDIS_URL for cloud (Upstash/Redis Labs) or fall back to host/port for local
const redis = REDIS_URL
  ? new IORedis(REDIS_URL, {
      maxRetriesPerRequest: null,   // required by BullMQ
      enableReadyCheck: false,
      retryStrategy(times: number) {
        const delay = Math.min(times * 500, 5000);
        console.log(`🔄 Redis retry #${times} – reconnecting in ${delay}ms`);
        return delay;
      },
    })
  : new IORedis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      maxRetriesPerRequest: null,   // required by BullMQ
      enableReadyCheck: false,
      retryStrategy(times: number) {
        const delay = Math.min(times * 500, 5000);
        console.log(`🔄 Redis retry #${times} – reconnecting in ${delay}ms`);
        return delay;
      },
    });

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err.message);
});

redis.on('close', () => {
  console.warn('⚠️  Redis connection closed');
});

export default redis;
