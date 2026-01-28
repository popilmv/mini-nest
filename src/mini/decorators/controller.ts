export function Controller(prefix = ''): ClassDecorator {
  return (target) => Reflect.defineMetadata('mini:controller_prefix', prefix, target);
}

