import type { NextFunction, Request, Response } from 'express';
import type { ZodIssue, ZodTypeAny } from 'zod';

export const validateResource = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (!result.success) {
      const issues = result.error.issues.map((issue: ZodIssue) => issue.message);
      return res.status(400).json({ message: issues.join(', ') });
    }

    const data = result.data as {
      body: typeof req.body;
      query: typeof req.query;
      params: typeof req.params;
    };

    req.body = data.body;

    // In Express 5, req.query and req.params are read-only getters
    // We need to replace them entirely instead of modifying in place
    (req as any).query = data.query;
    (req as any).params = data.params;

    next();
  };
};
