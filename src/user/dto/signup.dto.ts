import {
  ApiProperty,
  ApiResponseProperty,
  IntersectionType,
} from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches } from 'class-validator';
import { GenericResponseDto } from '../../shared/docs/dto/base.dto';

export class AdminSignUpDto extends IntersectionType(GenericResponseDto) {
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
    example: 'XT(v2EiTqQZ',
    description: 'The password for the user',
  })
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.,!@#$^&*()_-])[a-zA-Z\d.,!@#$^&*()_-]{8,32}$/gm,
    {
      message:
        'Password must be between 8 and 32 characters long with at least 1 special character and an uppercase character',
    },
  )
  password: string;

  @ApiProperty({
    example: 'L5NRjcTUQFt8zt2',
    description: 'The password for the facility',
  })
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.,!@#$^&*()_-])[a-zA-Z\d.,!@#$^&*()_-]{8,32}$/gm,
    {
      message:
        'Password must be between 8 and 32 characters long with at least 1 special character and an uppercase character',
    },
  )
  facillityPassword: string;

  @ApiResponseProperty({
    example: 'Central Admin',
  })
  role: string;

  @ApiResponseProperty({
    example: null,
  })
  departmentId: string;

  @ApiResponseProperty({
    example: [
      'items:READ',
      'item_categories:READ_WRITE',
      'stock_adjustment:READ_WRITE_DELETE',
      'item_orders:READ_WRITE_DELETE',
    ],
  })
  permissions: string[];

  @ApiResponseProperty({
    example: '9dcf380d-a58b-4f35-8870-9948af717cb8',
  })
  facilityId: string;

  @ApiResponseProperty({
    example: true,
  })
  accountActivated: boolean;

  @ApiResponseProperty({
    example: 'Active',
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
