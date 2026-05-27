import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vedaai';
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

export async function connectDB(): Promise<void> {
  let retries = 0;

  const connect = async (): Promise<void> => {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
    } catch (error) {
      retries += 1;
      console.error(
        `❌ MongoDB connection failed (attempt ${retries}/${MAX_RETRIES}):`,
        (error as Error).message
      );

      if (retries < MAX_RETRIES) {
        console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s…`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        return connect();
      }

      console.error('💀 Max retries reached. Exiting.');
      process.exit(1);
    }
  };

  // ── Connection event handlers ────────────────────────────────────────────
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected');
  });

  await connect();
}

export default connectDB;
