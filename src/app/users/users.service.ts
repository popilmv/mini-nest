import { Injectable } from '../../mini/decorators/injectable';
import { HttpException } from '../../mini/exceptions';

@Injectable()
export class UsersService {
  getById(id: string) {
    if (id.endsWith('0000')) {
      throw new HttpException(404, 'User not found', { id });
    }
    return { id, email: 'demo@mail.com' };
  }
}

