type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

function make(method: HttpMethod, path = ''): MethodDecorator {
  return (_t, _p, d) => {
    Reflect.defineMetadata('mini:http_method', method, d.value!);
    Reflect.defineMetadata('mini:http_path', path, d.value!);
  };
}

export const Get = (path = '') => make('GET', path);
export const Post = (path = '') => make('POST', path);
export const Put = (path = '') => make('PUT', path);
export const Patch = (path = '') => make('PATCH', path);
export const Delete = (path = '') => make('DELETE', path);

