import { ZodSchema } from 'zod';
import { PipeTransform } from './pipe';
import { HttpException } from '../exceptions';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: any) {
    const res = this.schema.safeParse(value);
    if (!res.success) {
      throw new HttpException(400, 'Validation error', res.error.flatten());
    }
    return res.data;
  }
}

