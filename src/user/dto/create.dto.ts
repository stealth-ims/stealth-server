import {
  ApiProperty,
  ApiResponseProperty,
  IntersectionType,
} from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches } from 'class-validator';
import { GenericResponseDto } from '../../shared/docs/dto/base.dto';

export class CreateUserDto extends IntersectionType(GenericResponseDto) {
  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the user',
  })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    example: 'example@email.com',
    description: 'The email of the user',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '0244335567',
    description: 'The phone number of the user',
  })
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    example: 'Greater Accra Regional Hospital',
    description: 'The facility using the Inventory System',
  })
  @IsNotEmpty()
  facility: string;

  @ApiProperty({
    example: 'pharmacy',
    description: 'The department the user is registering to',
  })
  @IsNotEmpty()
  department: string;

  @ApiProperty({
    example: 'pharmacist',
    description: 'The role the user is being registered as',
  })
  @IsNotEmpty()
  role: string;

  @ApiProperty({
    example: 'XT(v2EiTqQZ',
    description: 'The password for the user',
  })
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.,!@#$^&*()_-])[a-zA-Z\d.,!@#$^&*()_-]{8,32}$/gm,
    {
      message:
        'Password must be between 8 and 32 characters long with at least 1 special character and capital character each',
    },
  )
  password: string;

  @ApiResponseProperty({
    example: false,
  })
  accountApproved: boolean;

  @ApiResponseProperty({
    example: 'ACTIVE',
  })
  status: string;

  @ApiResponseProperty({
    example: null,
  })
  deactivatedBy: string;

  @ApiResponseProperty({
    example: null,
  })
  deletedAt: Date;

  @ApiResponseProperty({
    example: null,
  })
  deletedBy: string;
}
