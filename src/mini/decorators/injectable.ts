export function Injectable(): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata('mini:injectable', true, target);
  };
}

