import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = (error as any).issues || (error as any).errors || [];
        const formattedErrors = issues.map((err: any) => ({
          field: err.path ? err.path.join('.') : '',
          message: err.message,
        }));
        res.status(400).json({
          success: false,
          message: formattedErrors[0]?.message || 'Validation failed',
          errors: formattedErrors,
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: 'Invalid request data',
      });
      return;
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.query);
      req.query = parsed as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = (error as any).issues || (error as any).errors || [];
        const formattedErrors = issues.map((err: any) => ({
          field: err.path ? err.path.join('.') : '',
          message: err.message,
        }));
        res.status(400).json({
          success: false,
          message: formattedErrors[0]?.message || 'Validation failed',
          errors: formattedErrors,
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
      });
      return;
    }
  };
};
