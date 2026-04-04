import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError, asyncHandler } from '../utils/errors';

type Location = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, location: Location = 'body') {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req[location]);
      req[location] = result;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid request data', {
          errors: err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      throw err;
    }
  });
}
