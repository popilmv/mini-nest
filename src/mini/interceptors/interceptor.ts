import { Request, Response } from 'express';

export interface NestInterceptor {
  intercept(ctx: { req: Request; res: Response }, next: () => Promise<any>): Promise<any>;
}

