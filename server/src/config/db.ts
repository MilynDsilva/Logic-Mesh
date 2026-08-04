import mongoose from 'mongoose';

export async function connectDB(mongoUri?: string): Promise<typeof mongoose> {
  const uri = mongoUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/logicmesh';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err: any) {
    console.warn(`⚠️ MongoDB connection warning: ${err.message}. Defaulting to in-memory fallback store.`);
    return mongoose;
  }
}
