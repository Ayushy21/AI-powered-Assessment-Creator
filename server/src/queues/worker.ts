import { Worker, Job } from 'bullmq';
import { Server as SocketIOServer } from 'socket.io';
import redis from '../config/redis';
import Assignment from '../models/Assignment';
import { generatePaper } from '../services/gemini';
import { AssignmentInput } from '../types';

interface GenerationJobData {
  assignmentId: string;
}

const CACHE_TTL_SECONDS = 3600; // 1 hour

/**
 * Start the BullMQ worker. Requires the Socket.IO server instance
 * so it can emit real-time progress events to connected clients.
 */
export function startWorker(io: SocketIOServer): Worker {
  const worker = new Worker<GenerationJobData>(
    'assessment-generation',
    async (job: Job<GenerationJobData>) => {
      const { assignmentId } = job.data;
      const room = `assignment:${assignmentId}`;

      console.log(`⚙️  Worker processing job ${job.id} for assignment ${assignmentId}`);

      // ── 1. Fetch assignment from MongoDB ──────────────────────────────────
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        throw new Error(`Assignment ${assignmentId} not found`);
      }

      // ── 2. Update status to 'processing' ─────────────────────────────────
      assignment.status = 'processing';
      await assignment.save();

      // ── 3. Emit 'generation:started' ──────────────────────────────────────
      io.to(room).emit('generation:started', {
        assignmentId,
        status: 'processing',
        message: 'AI is generating your assessment paper…',
      });

      console.log(`📡 Emitted generation:started to room ${room}`);

      // ── 4. Call Gemini service ────────────────────────────────────────────
      const input: AssignmentInput = {
        title: assignment.title,
        subject: assignment.subject,
        grade: assignment.grade,
        dueDate: assignment.dueDate,
        questionTypes: assignment.questionTypes,
        numberOfQuestions: assignment.numberOfQuestions,
        totalMarks: assignment.totalMarks,
        difficulty: assignment.difficulty as AssignmentInput['difficulty'],
        additionalInstructions: assignment.additionalInstructions,
        uploadedFileText: assignment.uploadedFileText,
      };

      const generatedPaper = await generatePaper(input);

      // ── 5. Store result in MongoDB ────────────────────────────────────────
      assignment.status = 'completed';
      assignment.generatedPaper = generatedPaper;
      await assignment.save();

      console.log(`💾 Assignment ${assignmentId} saved with generated paper`);

      // ── 6. Cache in Redis with 1-hour TTL ─────────────────────────────────
      const cacheKey = `assignment:${assignmentId}`;
      await redis.set(cacheKey, JSON.stringify(assignment.toObject()), 'EX', CACHE_TTL_SECONDS);

      console.log(`🗄️  Cached assignment ${assignmentId} in Redis (TTL: ${CACHE_TTL_SECONDS}s)`);

      // ── 7. Emit 'generation:completed' ────────────────────────────────────
      io.to(room).emit('generation:completed', {
        assignmentId,
        status: 'completed',
        message: 'Assessment paper generated successfully!',
      });

      console.log(`📡 Emitted generation:completed to room ${room}`);

      return { assignmentId, status: 'completed' };
    },
    {
      connection: redis,
      concurrency: 2,
    }
  );

  // ── Worker event handlers ───────────────────────────────────────────────
  worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed successfully`);
  });

  worker.on('failed', async (job, err) => {
    if (!job) return;

    const { assignmentId } = job.data;
    const room = `assignment:${assignmentId}`;

    console.error(`❌ Job ${job.id} failed:`, err.message);

    // Update assignment status to 'failed'
    try {
      await Assignment.findByIdAndUpdate(assignmentId, {
        status: 'failed',
      });
    } catch (updateErr) {
      console.error('Failed to update assignment status:', (updateErr as Error).message);
    }

    // Emit 'generation:failed'
    io.to(room).emit('generation:failed', {
      assignmentId,
      status: 'failed',
      message: `Paper generation failed: ${err.message}`,
    });

    console.log(`📡 Emitted generation:failed to room ${room}`);
  });

  worker.on('error', (err) => {
    console.error('⚠️  Worker error:', err.message);
  });

  console.log('🔧 BullMQ worker started for "assessment-generation"');

  return worker;
}

export default startWorker;
