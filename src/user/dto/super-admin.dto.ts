import { ApiProperty, ApiResponseProperty, PickType } from '@nestjs/swagger';
import { CreateUserDto } from './create.dto';
import { IsNotEmpty, MinLength } from 'class-validator';

export class CreateSuperAdminDto extends PickType(CreateUserDto, [
  'fullName',
  'email',
]) {
  @ApiProperty({
    example: 'iok&UuGC%p',
    description: 'The password for the super admin user',
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

export class GetSuperAdminDto extends PickType(CreateUserDto, [
  'fullName',
  'username',
  'email',
  'role',
  'status',
]) {
  @ApiResponseProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
  })
  id: string;
}
