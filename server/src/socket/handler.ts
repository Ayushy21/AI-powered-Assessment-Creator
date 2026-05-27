import { Server as SocketIOServer, Socket } from 'socket.io';

/**
 * Set up Socket.IO event handlers.
 */
export function setupSocketHandlers(io: SocketIOServer): void {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // ── Join an assignment room for real-time updates ────────────────────
    socket.on('join:assignment', (assignmentId: string) => {
      if (!assignmentId || typeof assignmentId !== 'string') {
        socket.emit('error', { message: 'Invalid assignment ID' });
        return;
      }

      const room = `assignment:${assignmentId}`;
      socket.join(room);
      console.log(`📥 Client ${socket.id} joined room ${room}`);

      socket.emit('joined', {
        assignmentId,
        message: `Joined room for assignment ${assignmentId}`,
      });
    });

    // ── Leave an assignment room ────────────────────────────────────────
    socket.on('leave:assignment', (assignmentId: string) => {
      if (!assignmentId || typeof assignmentId !== 'string') {
        socket.emit('error', { message: 'Invalid assignment ID' });
        return;
      }

      const room = `assignment:${assignmentId}`;
      socket.leave(room);
      console.log(`📤 Client ${socket.id} left room ${room}`);
    });

    // ── Disconnect ──────────────────────────────────────────────────────
    socket.on('disconnect', (reason: string) => {
      console.log(`🔌 Client disconnected: ${socket.id} (${reason})`);
    });
  });

  console.log('🔌 Socket.IO handlers configured');
}

export default setupSocketHandlers;
