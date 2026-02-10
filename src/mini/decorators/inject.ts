import 'reflect-metadata';
import { Token } from '../tokens';
const INJECT_TOKENS_KEY = 'mini:inject_tokens';
function getCtor(target: any): Function {
  return typeof target === 'function' ? target : target?.constructor;
}
export function Inject(token: Token): ParameterDecorator {
  return (target: object, _propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const ctor = getCtor(target);
    const existing: Record<number, Token> =
      Reflect.getMetadata(INJECT_TOKENS_KEY, ctor) ?? {};
    existing[parameterIndex] = token;
    Reflect.defineMetadata(INJECT_TOKENS_KEY, existing, ctor);
  };
}
export function getInjectTokens(ctor: Function): Record<number, Token> {
  return Reflect.getMetadata(INJECT_TOKENS_KEY, ctor) ?? {};
}
