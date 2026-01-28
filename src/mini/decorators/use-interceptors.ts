export function UseInterceptors(...interceptors: any[]): MethodDecorator & ClassDecorator {
  return (target: any, _k?: any, d?: PropertyDescriptor) => {
    if (d?.value) Reflect.defineMetadata('mini:interceptors', interceptors, d.value);
    else Reflect.defineMetadata('mini:interceptors', interceptors, target);
  };
}

