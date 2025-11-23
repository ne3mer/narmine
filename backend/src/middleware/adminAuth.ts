import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { ApiError } from './errorHandler';

export const adminAuth = (req: Request, _res: Response, next: NextFunction) => {
  // Check for Admin Role from JWT (if authenticated via authenticateUser)
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  // Check for API key (server-to-server or special access)
  if (env.ADMIN_API_KEY) {
    const adminKey = req.header('x-admin-key');
    if (adminKey === env.ADMIN_API_KEY) {
      return next();
    }
  }

  return next(new ApiError(403, 'Unauthorized admin access'));
};
