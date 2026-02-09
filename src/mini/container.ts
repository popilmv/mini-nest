import { getInjectTokens } from './decorators/inject';
import { Token } from './tokens';

type Provider =
  | { provide: Token; useClass: new (...args: any[]) => any }
  | { provide: Token; useValue: any };

export class Container {
  private providers = new Map<Token, Provider>();
  private singletons = new Map<Token, any>();

  register(p: Provider) {
    this.providers.set(p.provide, p);
  }

  resolve<T>(token: Token<T>): T {
    if (this.singletons.has(token)) return this.singletons.get(token);

    const provider = this.providers.get(token);
    if (provider) {
      if ('useValue' in provider) {
        this.singletons.set(token, provider.useValue);
        return provider.useValue;
      }
      const instance = this.instantiate(provider.useClass);
      this.singletons.set(token, instance);
      return instance;
    }

    if (typeof token === 'function') {
      const instance = this.instantiate(token);
      this.singletons.set(token, instance);
      return instance;
    }

    throw new Error(`Cannot resolve token: ${String(token)}`);
  }

  private instantiate<T>(clazz: new (...args: any[]) => T): T {
    const paramTypes = Reflect.getMetadata('design:paramtypes', clazz) ?? [];
    const injectOverrides = getInjectTokens(clazz);

    const deps = paramTypes.map((p: any, idx: number) => {
      const token = injectOverrides[idx] ?? p;
      return this.resolve(token);
    });

    return new clazz(...deps);
  }
}
