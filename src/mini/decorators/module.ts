import { ModuleMeta } from '../module';

export function Module(meta: ModuleMeta): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata('mini:module', meta, target);
  };
}

