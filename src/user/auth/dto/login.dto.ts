import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'example@email.com',
    description: 'The email of the registered user',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'XT(v2EiTqQZ',
    description: 'The password for the user',
  })
  @IsNotEmpty()
  password: string;
}
