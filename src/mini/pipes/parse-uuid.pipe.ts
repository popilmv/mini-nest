import { PipeTransform } from './pipe';
import { HttpException } from '../exceptions';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ParseUUIDPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value !== 'string' || !UUID_RE.test(value)) {
      throw new HttpException(400, 'Validation failed (uuid is expected)', { field: 'id' });
    }
    return value;
  }
}

