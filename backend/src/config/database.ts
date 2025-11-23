import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

mongoose.set('strictQuery', true);

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info('📦 Connected to MongoDB', { uri: env.MONGODB_URI });
  } catch (error) {
    logger.error('❌ MongoDB connection failed', { error });
    process.exit(1);
  }
};
