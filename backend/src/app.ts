import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

export const createApp = () => {
  const app = express();

  // Security Headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } // Allow loading images from uploads
  }));

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
  });
  app.use('/api', limiter);

  // Data Sanitization against NoSQL query injection
  app.use(mongoSanitize());

  // Data Sanitization against XSS
  app.use(xss());

  // Prevent Parameter Pollution
  app.use(hpp());

  // CORS configuration - support multiple origins in production
  // Always allow these origins regardless of environment
  const allowedOrigins = [
    'https://narmineh.com',
    'https://www.narmineh.com',
    ...(env.CLIENT_URL ? env.CLIENT_URL.split(',').map((url) => url.trim()) : []),
    'http://localhost:3000'
  ];

  console.log('Allowed CORS Origins:', allowedOrigins);

  const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key', 'x-client-version', 'x-requested-with'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    preflightContinue: false,
    optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
  };

  app.use(cors(corsOptions));
  
  app.use((_req, res, next) => {
    res.header('Vary', 'Origin');
    next();
  });
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/', (_req, res) => {
    res.json({ message: 'Narmine Backend API is running', version: '1.0.0' });
  });

  // Serve static files from uploads directory
  app.use('/uploads', express.static('public/uploads'));

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
