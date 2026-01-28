export function UsePipes(...pipes: any[]): MethodDecorator & ClassDecorator {
  return (target: any, _k?: any, d?: PropertyDescriptor) => {
    if (d?.value) Reflect.defineMetadata('mini:pipes', pipes, d.value);
    else Reflect.defineMetadata('mini:pipes', pipes, target);
  };
}

