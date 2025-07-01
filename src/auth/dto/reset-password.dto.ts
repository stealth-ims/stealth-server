import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    example: 'email@example.com',
    description: 'email to be sent for password reset',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class SendForgotPasswordEmailDto {
  @ApiProperty({
    example: 'j.doe3256',
    description: 'Username of the user requesting password reset',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiPropertyOptional({
    example: 'email@example.com',
    description: 'Email to be sent for password reset',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: '+233555538672',
    description: 'The phone number of the user',
  })
  @IsOptional()
  @IsPhoneNumber('GH')
  phoneNumber?: string;
}

export class ValidateCodeDto {
  @ApiProperty({
    example: 'j.doe3256',
    description: 'Username of the user requesting password reset',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    example: 14925,
    description: 'Received code',
  })
  @IsNotEmpty()
  @Max(99999)
  @Min(10000)
  code: number;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: 'j.doe3256',
    description: 'Username of the user requesting password reset',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

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

export class CheckCodeDto {
  @ApiProperty({
    example: 'email@example.com',
    description: 'email to be sent for password reset',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 14925,
    description: 'email received code',
  })
  @IsNotEmpty()
  @Max(99999)
  @Min(10000)
  code: number;
}

export class ChangePasswordDto extends PickType(ResetPasswordDto, [
  'newPassword',
]) {
  @ApiProperty({
    example: 'XT(v2EiTqQZ',
    description: 'The old password',
  })
  @IsOptional()
  // @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.,!@#$^&*()_-])[a-zA-Z\d.,!@#$^&*()_-]{8,32}$/gm,
    {
      message:
        'Password must be between 8 and 32 characters long with at least 1 special character and an uppercase character',
    },
  )
  oldPassword: string;
}
