import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateLoginSessionDto } from './login-session.dto';

export class LoginDto {
  @ApiProperty({
    example: 'jack frost',
    examples: ['example@gmail.com', 'j.doe3256'],
    description: 'The email or username of the registered user',
  })
  @IsNotEmpty()
  @IsString()
  accountIdentifier: string;

  @ApiProperty({
    example: 'XT(v2EiTqQZ',
    description: 'The password for the user',
  })
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    type: CreateLoginSessionDto,
    description: 'Login session metadata',
  })
  @IsOptional()
  loginSessionMeta?: CreateLoginSessionDto;
}
