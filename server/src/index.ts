import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import multer from 'multer';

import { connectDB } from './config/db';
import { setupSocketHandlers } from './socket/handler';
import { startWorker } from './queues/worker';
import assignmentRoutes from './routes/assignment';

// ── Configuration ────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '5000', 10);
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// ── Express app ──────────────────────────────────────────────────────────────
const app = express();

// Middleware
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Multer for file uploads (memory storage — files are processed in-memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// Make upload middleware available on a specific route
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, error: 'No file uploaded' });
    return;
  }

  // For text files, extract the content directly
  const text = req.file.buffer.toString('utf-8');

  res.status(200).json({
    success: true,
    data: {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      text,
    },
  });
});

// ── HTTP server & Socket.IO ──────────────────────────────────────────────────
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/assignments', assignmentRoutes);

// ── Start server ─────────────────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Set up Socket.IO handlers
    setupSocketHandlers(io);

    // 3. Start BullMQ worker with Socket.IO instance
    startWorker(io);

    // 4. Start listening
    server.listen(PORT, () => {
      console.log(`\n🚀 VedaAI server running on http://localhost:${PORT}`);
      console.log(`📡 WebSocket server ready`);
      console.log(`🌐 CORS origin: ${CLIENT_URL}\n`);
    });
  } catch (error) {
    console.error('💀 Failed to start server:', (error as Error).message);
    process.exit(1);
  }
}

// ── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully…`);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

bootstrap();
