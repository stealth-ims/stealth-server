import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from '../../user/dto';

export class GetAdminUserDto extends PickType(CreateUserDto, [
  'fullName',
  'role',
  'status',
]) {}
