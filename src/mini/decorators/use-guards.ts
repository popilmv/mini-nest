export function UseGuards(...guards: any[]): MethodDecorator & ClassDecorator {
  return (target: any, _k?: any, d?: PropertyDescriptor) => {
    if (d?.value) Reflect.defineMetadata('mini:guards', guards, d.value);
    else Reflect.defineMetadata('mini:guards', guards, target);
  };
}

