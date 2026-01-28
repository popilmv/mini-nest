import { Request, Response, NextFunction } from 'express';

export interface ExceptionFilter {
  catch(err: unknown, req: Request, res: Response, next: NextFunction): void;
}

