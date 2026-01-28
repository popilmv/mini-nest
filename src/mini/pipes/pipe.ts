export interface PipeTransform {
  transform(value: any, meta?: { source: 'param' | 'query' | 'body'; name?: string }): any;
}

