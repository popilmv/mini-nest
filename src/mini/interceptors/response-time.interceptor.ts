import { NestInterceptor } from './interceptor';

export class ResponseTimeInterceptor implements NestInterceptor {
  async intercept(ctx: any, next: () => Promise<any>) {
    const start = Date.now();
    try {
      return await next();
    } finally {
      console.log(JSON.stringify({ path: ctx.req.path, ms: Date.now() - start }));
    }
  }
}

