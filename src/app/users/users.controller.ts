import { Controller } from '../../mini/decorators/controller';
import { Get } from '../../mini/decorators/methods';
import { Param } from '../../mini/decorators/params';
import { ParseUUIDPipe } from '../../mini/pipes/parse-uuid.pipe';
import { UseInterceptors } from '../../mini/decorators/use-interceptors';
import { ResponseTimeInterceptor } from '../../mini/interceptors/response-time.interceptor';
import { UsersService } from './users.service';

@Controller('users')
@UseInterceptors(ResponseTimeInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getById(id);
  }
}

