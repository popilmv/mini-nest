export type ParamSource = 'param' | 'query' | 'body';
export type ParamMeta = { index: number; source: ParamSource; name?: string; pipes: any[] };

function addParamMeta(handler: Function, meta: ParamMeta) {
  const all: ParamMeta[] = Reflect.getMetadata('mini:params', handler) ?? [];
  all.push(meta);
  Reflect.defineMetadata('mini:params', all, handler);
}

export function Param(name?: string, ...pipes: any[]): ParameterDecorator {
  return (target, propertyKey, index) => {
    const handler = (target as any)[propertyKey as string];
    addParamMeta(handler, { index, source: 'param', name, pipes });
  };
}

export function Query(name?: string, ...pipes: any[]): ParameterDecorator {
  return (target, propertyKey, index) => {
    const handler = (target as any)[propertyKey as string];
    addParamMeta(handler, { index, source: 'query', name, pipes });
  };
}

export function Body(...pipes: any[]): ParameterDecorator {
  return (target, propertyKey, index) => {
    const handler = (target as any)[propertyKey as string];
    addParamMeta(handler, { index, source: 'body', pipes });
  };
}

