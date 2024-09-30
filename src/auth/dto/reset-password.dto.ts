import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches, Max, Min } from 'class-validator';

export class SendForgotPasswordEmailDto {
  @ApiProperty({
    example: 'email@example.com',
    description: 'email to be sent for password reset',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class CheckCodeDto {
  @ApiProperty({
    example: 'email@example.com',
    description: 'email to be sent for password reset',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 1492,
    description: 'email received code',
  })
  @IsNotEmpty()
  @Max(9999)
  @Min(1000)
  code: number;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: 'email@example.com',
    description: 'email to be sent for password reset',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Dxd&D2q,xKJ2',
    description: 'The new password',
  })
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.,!@#$^&*()_-])[a-zA-Z\d.,!@#$^&*()_-]{8,32}$/gm,
    {
      message:
        'Password must be between 8 and 32 characters long with at least 1 special character and an uppercase character',
    },
  )
  newPassword: string;
}
