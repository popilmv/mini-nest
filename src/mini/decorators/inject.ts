import { Token } from '../tokens';

export function Inject(token: Token): ParameterDecorator {
  return (target, _prop, index) => {
    const ctor = target.constructor;
    const map: Map<number, Token> = Reflect.getMetadata('mini:inject_tokens', ctor) ?? new Map();
    map.set(index, token);
    Reflect.defineMetadata('mini:inject_tokens', map, ctor);
  };
}

