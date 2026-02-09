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

type PipeMeta = { source: 'param' | 'query' | 'body'; name?: string };

function resolvePipes(container: Container, list: any[]) {
  return (list ?? []).map((P) => {
    if (typeof P === 'function' && P.prototype?.transform) {
      return container.resolve(P);
    }
    return P;
  });
}
function applyPipe(pipe: any, value: any, meta: PipeMeta) {
  if (pipe && typeof pipe.transform === 'function') {
    return pipe.transform(value, meta);
  }
  if (typeof pipe === 'function' && pipe.prototype?.transform) {
    const inst = new pipe();
    return inst.transform(value, meta);
  }
  if (typeof pipe === 'function') {
    return pipe(value, meta);
  }
  return value;
}

export function createPipeline(container: Container, config: GlobalConfig) {
  return async function handle(route: RouteDef, req: Request, res: Response, next: NextFunction) {
    try {
      const controller = container.resolve(route.controllerClass) as any;
      const proto = route.controllerClass.prototype;
      const originalHandler = proto[route.handlerName];
      const handlerFn = controller[route.handlerName].bind(controller);
      const paramsMeta = (Reflect.getMetadata('mini:params', originalHandler) ?? []) as any[];
      const args: any[] = [];
      for (const pm of paramsMeta) {
        let value: any;
        if (pm.source === 'param') value = pm.name ? (req.params as any)[pm.name] : req.params;
        if (pm.source === 'query') value = pm.name ? (req.query as any)[pm.name] : req.query;
        if (pm.source === 'body') value = req.body;
        args[pm.index] = value;
      }
      const controllerPipes = (Reflect.getMetadata('mini:pipes', route.controllerClass) ?? []) as any[];
      const methodPipes = (Reflect.getMetadata('mini:pipes', originalHandler) ?? []) as any[];
      const globalPipes = config.globalPipes ?? [];
      const gp = resolvePipes(container, globalPipes);
      const cp = resolvePipes(container, controllerPipes);
      const mp = resolvePipes(container, methodPipes);
      // global -> controller -> method -> param
      for (const pm of paramsMeta) {
        const meta: PipeMeta = { source: pm.source, name: pm.name };
        let v = args[pm.index];
        for (const pipe of gp) v = applyPipe(pipe, v, meta);
        for (const pipe of cp) v = applyPipe(pipe, v, meta);
        for (const pipe of mp) v = applyPipe(pipe, v, meta);
        const paramPipes = resolvePipes(container, pm.pipes ?? []);
        for (const pipe of paramPipes) v = applyPipe(pipe, v, meta);
        args[pm.index] = v;
      }
      // Guards
      const controllerGuards = (Reflect.getMetadata('mini:guards', route.controllerClass) ?? []) as any[];
      const methodGuards = (Reflect.getMetadata('mini:guards', originalHandler) ?? []) as any[];
      const guards = [...controllerGuards, ...methodGuards].map((G) =>
        typeof G === 'function' ? container.resolve(G) : G,
      ) as CanActivate[];
      for (const g of guards) {
        const ok = await g.canActivate(req);
        if (!ok) throw new HttpException(403, 'Forbidden');
      }
      // Interceptors
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
