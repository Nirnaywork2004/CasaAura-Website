import mongoose from 'mongoose';

/**
 * MongoDB Database Connection Manager
 * 
 * Handles connecting to MongoDB using Mongoose with proper event listeners,
 * error handling, and reconnection strategies.
 */
export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '' || uri.includes('<username>')) {
    console.warn('\n⚠️  [MongoDB] MONGODB_URI is not configured in .env');
    console.warn('ℹ️  [MongoDB] Running with database in disconnected mode. Set MONGODB_URI to connect to MongoDB.\n');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ [MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ [MongoDB] Connection error: ${errMessage}`);
    console.warn('ℹ️  [MongoDB] Server will continue running without database connectivity.');
  }
};

// Monitor connection events
mongoose.connection.on('connected', () => {
  console.log('📡 [MongoDB] Connection state: Connected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ [MongoDB] Runtime connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 [MongoDB] Connection state: Disconnected');
});

/**
 * Helper to check current database status
 */
export const getDatabaseStatus = (): { isConnected: boolean; state: string } => {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const state = states[mongoose.connection.readyState] || 'unknown';
  return {
    isConnected: mongoose.connection.readyState === 1,
    state,
  };
};
