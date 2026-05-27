import { Router, Request, Response } from 'express';
import Assignment from '../models/Assignment';
import generationQueue from '../queues/generationQueue';
import redis from '../config/redis';
import { AssignmentInput } from '../types';

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/assignments — Create a new assignment and queue AI generation
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Partial<AssignmentInput>;

    // ── Validate required fields ────────────────────────────────────────
    const errors: string[] = [];
    if (!body.title || typeof body.title !== 'string') errors.push('title is required');
    if (!body.subject || typeof body.subject !== 'string') errors.push('subject is required');
    if (!body.grade || typeof body.grade !== 'string') errors.push('grade is required');
    if (!body.numberOfQuestions || typeof body.numberOfQuestions !== 'number' || body.numberOfQuestions < 1) {
      errors.push('numberOfQuestions must be a positive number');
    }
    if (!body.totalMarks || typeof body.totalMarks !== 'number' || body.totalMarks < 1) {
      errors.push('totalMarks must be a positive number');
    }
    if (!body.questionTypes || !Array.isArray(body.questionTypes) || body.questionTypes.length === 0) {
      errors.push('questionTypes must be a non-empty array');
    }

    if (errors.length > 0) {
      res.status(400).json({ success: false, errors });
      return;
    }

    // ── Create assignment document ──────────────────────────────────────
    const assignment = await Assignment.create({
      title: body.title,
      subject: body.subject,
      grade: body.grade,
      dueDate: body.dueDate || '',
      questionTypes: body.questionTypes,
      numberOfQuestions: body.numberOfQuestions,
      totalMarks: body.totalMarks,
      difficulty: body.difficulty || 'medium',
      additionalInstructions: body.additionalInstructions || '',
      uploadedFileText: body.uploadedFileText || '',
      status: 'pending',
      generatedPaper: null,
    });

    console.log(`📝 Assignment created: ${assignment._id}`);

    // ── Add job to BullMQ queue ─────────────────────────────────────────
    const job = await generationQueue.add(
      'generate-paper',
      { assignmentId: assignment._id.toString() },
      { jobId: `gen-${assignment._id.toString()}` }
    );

    // Store jobId on the assignment
    assignment.jobId = job.id || '';
    await assignment.save();

    console.log(`📋 Job queued: ${job.id}`);

    res.status(201).json({
      success: true,
      data: {
        id: assignment._id,
        status: assignment.status,
        jobId: job.id,
      },
    });
  } catch (error) {
    console.error('❌ POST /api/assignments error:', (error as Error).message);
    res.status(500).json({
      success: false,
      error: 'Failed to create assignment',
      message: (error as Error).message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/assignments — List all assignments (sorted newest first)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const assignments = await Assignment.find()
      .sort({ createdAt: -1 })
      .select('-uploadedFileText')        // exclude large text field from list view
      .lean();

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    console.error('❌ GET /api/assignments error:', (error as Error).message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assignments',
      message: (error as Error).message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/assignments/:id — Get single assignment (Redis cache → MongoDB)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // ── Check Redis cache first ─────────────────────────────────────────
    const cacheKey = `assignment:${id}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log(`🗄️  Cache HIT for assignment ${id}`);
      res.status(200).json({
        success: true,
        source: 'cache',
        data: JSON.parse(cached),
      });
      return;
    }

    console.log(`🗄️  Cache MISS for assignment ${id}`);

    // ── Fetch from MongoDB ──────────────────────────────────────────────
    const assignment = await Assignment.findById(id).lean();

    if (!assignment) {
      res.status(404).json({
        success: false,
        error: 'Assignment not found',
      });
      return;
    }

    // Cache for future requests (1 hour TTL)
    await redis.set(cacheKey, JSON.stringify(assignment), 'EX', 3600);

    res.status(200).json({
      success: true,
      source: 'database',
      data: assignment,
    });
  } catch (error) {
    console.error('❌ GET /api/assignments/:id error:', (error as Error).message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assignment',
      message: (error as Error).message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/assignments/:id/regenerate — Re-queue paper generation
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:id/regenerate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id);

    if (!assignment) {
      res.status(404).json({
        success: false,
        error: 'Assignment not found',
      });
      return;
    }

    // ── Reset status and clear previous paper ───────────────────────────
    assignment.status = 'pending';
    assignment.generatedPaper = null;
    await assignment.save();

    // ── Invalidate Redis cache ──────────────────────────────────────────
    const cacheKey = `assignment:${id}`;
    await redis.del(cacheKey);

    // ── Add new job to queue ────────────────────────────────────────────
    const job = await generationQueue.add(
      'generate-paper',
      { assignmentId: id },
      { jobId: `regen-${id}-${Date.now()}` }
    );

    assignment.jobId = job.id || '';
    await assignment.save();

    console.log(`🔄 Regeneration queued for assignment ${id}, job ${job.id}`);

    res.status(200).json({
      success: true,
      data: {
        id: assignment._id,
        status: assignment.status,
        jobId: job.id,
      },
    });
  } catch (error) {
    console.error('❌ POST /api/assignments/:id/regenerate error:', (error as Error).message);
    res.status(500).json({
      success: false,
      error: 'Failed to regenerate assignment',
      message: (error as Error).message,
    });
  }
});

export default router;
