export type Token<T = any> = (new (...args: any[]) => T) | string | symbol;

