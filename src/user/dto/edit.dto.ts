import { PartialType, PickType } from '@nestjs/swagger';
import { CreateUserDto } from './create.dto';

export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, ['fullName', 'email', 'phoneNumber']),
) {}
