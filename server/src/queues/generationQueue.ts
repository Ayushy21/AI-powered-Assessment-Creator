import { Queue } from 'bullmq';
import redis from '../config/redis';

const generationQueue = new Queue('assessment-generation', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
    removeOnComplete: {
      age: 3600,       // keep completed jobs for 1 hour
      count: 100,      // keep last 100 completed jobs
    },
    removeOnFail: {
      age: 86400,      // keep failed jobs for 24 hours
    },
  },
});

console.log('📋 BullMQ queue "assessment-generation" initialized');

export default generationQueue;
