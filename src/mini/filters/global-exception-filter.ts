import { ExceptionFilter } from './filter';
import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions';

export class GlobalExceptionFilter implements ExceptionFilter {
  catch(err: unknown, req: Request, res: Response, _next: NextFunction) {
    if (err instanceof HttpException) {
      return res.status(err.status).json({
        statusCode: err.status,
        code: err.status === 400 ? 'BAD_REQUEST' : 'HTTP_EXCEPTION',
        message: err.message,
        details: err.details,
        path: req.path,
        timestamp: new Date().toISOString(),
      });
    }

    console.error(err);
    return res.status(500).json({
      statusCode: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unexpected error',
      path: req.path,
      timestamp: new Date().toISOString(),
    });
  }
}

