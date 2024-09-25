import { OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create.dto';

export class GetUserDto extends OmitType(CreateUserDto, ['password']) {}
