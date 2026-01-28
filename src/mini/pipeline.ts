import { Request, Response, NextFunction } from 'express';
import { Container } from './container';
import { RouteDef } from './router';
import { PipeTransform } from './pipes/pipe';
import { CanActivate } from './guards/guard';
import { NestInterceptor } from './interceptors/interceptor';
import { HttpException } from './exceptions';

export type GlobalConfig = {
  globalPipes: any[];
  globalFilters: any[];
};

export function createPipeline(container: Container, config: GlobalConfig) {
  return async function handle(route: RouteDef, req: Request, res: Response, next: NextFunction) {
    try {
      //  DI
      const controller = container.resolve(route.controllerClass) as any;
      const proto = route.controllerClass.prototype;
      const originalHandler = proto[route.handlerName];
      const handlerFn = controller[route.handlerName].bind(controller);

      // params
      const paramsMeta = (Reflect.getMetadata('mini:params', originalHandler) ?? []) as any[];

      // args
      const args: any[] = [];
      for (const pm of paramsMeta) {
        let value: any;
        if (pm.source === 'param') value = pm.name ? (req.params as any)[pm.name] : req.params;
        if (pm.source === 'query') value = pm.name ? (req.query as any)[pm.name] : req.query;
        if (pm.source === 'body') value = req.body;
        args[pm.index] = value;
      }

      // Pipes 
      const controllerPipes = (Reflect.getMetadata('mini:pipes', route.controllerClass) ?? []) as any[];
      const methodPipes = (Reflect.getMetadata('mini:pipes', originalHandler) ?? []) as any[];
      const globalPipes = config.globalPipes ?? [];

      const resolved = (list: any[]) =>
        list.map((P) => (typeof P === 'function' ? container.resolve(P) : P)) as PipeTransform[];

      const gp = resolved(globalPipes);
      const cp = resolved(controllerPipes);
      const mp = resolved(methodPipes);

      
      for (const pm of paramsMeta) {
        let v = args[pm.index];
        for (const pipe of gp) v = pipe.transform(v, { source: pm.source, name: pm.name });
        for (const pipe of cp) v = pipe.transform(v, { source: pm.source, name: pm.name });
        for (const pipe of mp) v = pipe.transform(v, { source: pm.source, name: pm.name });

        
        const paramPipes = resolved(pm.pipes ?? []);
        for (const pipe of paramPipes) v = pipe.transform(v, { source: pm.source, name: pm.name });

        args[pm.index] = v;
      }

      // Guard
      const controllerGuards = (Reflect.getMetadata('mini:guards', route.controllerClass) ?? []) as any[];
      const methodGuards = (Reflect.getMetadata('mini:guards', originalHandler) ?? []) as any[];
      const guards = [...controllerGuards, ...methodGuards].map((G) =>
        typeof G === 'function' ? container.resolve(G) : G,
      ) as CanActivate[];

      for (const g of guards) {
        const ok = await g.canActivate(req);
        if (!ok) throw new HttpException(403, 'Forbidden');
      }

      // nterceptors 
      const controllerInts = (Reflect.getMetadata('mini:interceptors', route.controllerClass) ?? []) as any[];
      const methodInts = (Reflect.getMetadata('mini:interceptors', originalHandler) ?? []) as any[];
      const interceptors = [...controllerInts, ...methodInts].map((I) =>
        typeof I === 'function' ? container.resolve(I) : I,
      ) as NestInterceptor[];

      const invokeHandler = async () => handlerFn(...args);

      const chain = interceptors.reduceRight(
        (nextFn, interceptor) => () => interceptor.intercept({ req, res }, nextFn),
        invokeHandler,
      );

      const result = await chain();

      if (!res.headersSent) res.json(result);
    } catch (err) {
      next(err); 
    }
  };
}

