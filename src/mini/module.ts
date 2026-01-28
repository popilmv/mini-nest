import { Token } from './tokens';

export type ProviderDef =
  | Token
  | { provide: Token; useClass?: any; useValue?: any };

export type ModuleMeta = {
  providers?: ProviderDef[];
  controllers?: any[];
  imports?: any[];
  exports?: Token[];
};

