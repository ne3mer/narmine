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

    const currentQuery = req.query as Record<string, unknown>;
    Object.keys(currentQuery).forEach((key) => delete currentQuery[key]);
    Object.assign(currentQuery, data.query);

    const currentParams = req.params as Record<string, unknown>;
    Object.keys(currentParams).forEach((key) => delete currentParams[key]);
    Object.assign(currentParams, data.params);

    next();
  };
};
