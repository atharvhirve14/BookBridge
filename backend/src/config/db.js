import mongoose from 'mongoose';

let memoryServer = null;

/**
 * Connects to MongoDB.
 * 1. Tries MONGODB_URI (local MongoDB / Atlas).
 * 2. If it is unreachable (and we are not in production), falls back to an embedded
 *    in-memory MongoDB so the app still runs with zero manual setup.
 * Returns { embedded: boolean }.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bookbridge';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    console.log(`MongoDB connected: ${uri}`);
    return { embedded: false };
  } catch (err) {
    if (process.env.NODE_ENV === 'production') throw err;
    console.warn(`Could not reach MongoDB at ${uri} (${err.message})`);
    console.warn('Starting embedded in-memory MongoDB instead (data resets on restart)...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create({ instance: { dbName: 'bookbridge' } });
    await mongoose.connect(memoryServer.getUri());
    console.log('Embedded MongoDB ready.');
    return { embedded: true };
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}
