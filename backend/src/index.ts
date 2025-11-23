import { createServer } from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';

const bootstrap = async () => {
  await connectDatabase();
  const app = createApp();
  const server = createServer(app);

  server.listen(env.port, () => {
    logger.info(`🚀 API server listening on http://localhost:${env.port}`);
  });
};

bootstrap().catch((error) => {
  logger.error('Unexpected bootstrap error', { error });
  process.exit(1);
});
