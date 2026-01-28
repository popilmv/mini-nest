import express, { Express } from 'express';
import { Container } from './container';
import { RouteDef } from './router';
import { createPipeline } from './pipeline';
import { GlobalExceptionFilter } from './filters/global-exception-filter';

type ModuleMeta = any;

class MiniApp {
  private app: Express;
  private container = new Container();
  private routes: RouteDef[] = [];
  private globalPipes: any[] = [];

  constructor(private rootModule: any) {
    this.app = express();
    this.app.use(express.json());
  }

  useGlobalPipes(...pipes: any[]) {
    this.globalPipes.push(...pipes);
  }

  async listen(port: number) {
    const modules = this.collectModules(this.rootModule);
    this.registerProviders(modules);
    this.routes = this.buildRoutes(modules);
    const handler = createPipeline(this.container, { globalPipes: this.globalPipes, globalFilters: [] });
    for (const r of this.routes) {
      (this.app as any)[r.method.toLowerCase()](r.path, (req: any, res: any, next: any) =>
        handler(r, req, res, next),
      );
    }
    const filter = new GlobalExceptionFilter();
    this.app.use((err: any, req: any, res: any, next: any) => filter.catch(err, req, res, next));

    console.log('Routes:');
    for (const r of this.routes) console.log(`${r.method} ${r.path}`);

    return new Promise<void>((resolve) => {
      this.app.listen(port, () => resolve());
    });
  }

  private collectModules(root: any) {
    const out: any[] = [];
    const seen = new Set<any>();
    const dfs = (m: any) => {
      if (seen.has(m)) return;
      seen.add(m);
      out.push(m);
      const meta: ModuleMeta = Reflect.getMetadata('mini:module', m) ?? {};
      for (const imp of meta.imports ?? []) dfs(imp);
    };
    dfs(root);
    return out;
  }

  private registerProviders(modules: any[]) {
    for (const m of modules) {
      const meta: ModuleMeta = Reflect.getMetadata('mini:module', m) ?? {};
      for (const p of meta.providers ?? []) {
        if (typeof p === 'function' || typeof p === 'string' || typeof p === 'symbol') {
          this.container.register({ provide: p, useClass: p });
        } else if (p.useValue !== undefined) {
          this.container.register({ provide: p.provide, useValue: p.useValue });
        } else {
          this.container.register({ provide: p.provide, useClass: p.useClass });
        }
      }
      for (const c of meta.controllers ?? []) {
        this.container.register({ provide: c, useClass: c });
      }
    }
  }

  private buildRoutes(modules: any[]): RouteDef[] {
    const routes: RouteDef[] = [];
    for (const m of modules) {
      const meta: ModuleMeta = Reflect.getMetadata('mini:module', m) ?? {};
      for (const ctrl of meta.controllers ?? []) {
        const prefix = Reflect.getMetadata('mini:controller_prefix', ctrl) ?? '';
        const proto = ctrl.prototype;
        for (const name of Object.getOwnPropertyNames(proto)) {
          if (name === 'constructor') continue;
          const fn = proto[name];
          const method = Reflect.getMetadata('mini:http_method', fn);
          if (!method) continue;
          const path = Reflect.getMetadata('mini:http_path', fn) ?? '';
          const full = `/${[prefix, path].filter(Boolean).join('/')}`.replace(/\/+/g, '/');
          routes.push({ method, path: full, controllerClass: ctrl, handlerName: name });
        }
      }
    }
    return routes;
  }
}

export class NestFactory {
  static async create(rootModule: any) {
    return new MiniApp(rootModule);
  }
}

