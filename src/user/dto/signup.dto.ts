import {
  ApiProperty,
  ApiPropertyOptional,
  ApiResponseProperty,
  IntersectionType,
} from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  Matches,
} from 'class-validator';
import { GenericResponseDto } from '../../core/shared/dto/base.dto';
import { CreateFacilityDto } from '../../admin/facility/dto';

// enum FacilityType {
//   HOSPITAL = 'hospital',
//   PHARMACY = 'pharmacy',
// }
export class AdminSignUpDto extends IntersectionType(GenericResponseDto) {
  @ApiProperty({
    example: 'Jack Frost',
    description: 'The full name of the user',
  })
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({
    example: 'newUser@email.com',
    description: 'The email of the user',
  })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'The primary phone number of the contact person.',
    example: '+233555538672',
  })
  @IsOptional()
  @IsPhoneNumber('GH')
  phoneNumber: string;

  // @ApiProperty({
  //   example: 'hospital',
  //   enum: FacilityType,
  //   description:
  //     'The kind of facility whether it will be hospital or local pharmacy',
  // })
  // @IsNotEmpty()
  // @IsEnum(FacilityType)
  // facilityType: string;

  @ApiProperty({
    description: 'The name of the facility',
    type: CreateFacilityDto,
  })
  @IsNotEmpty()
  facility: CreateFacilityDto;

  @ApiProperty({
    example: 'rh.YEqFT1zyT!Qu',
    description: 'The password for the new admin',
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
      'items:READ_WRITE_DELETE',
      'item_categories:READ_WRITE_DELETE',
      'stock_adjustment:READ_WRITE_DELETE',
      'item_orders:READ_WRITE_DELETE',
      'reports:READ_WRITE_DELETE',
      'suppliers:READ_WRITE_DELETE',
      'sales:READ_WRITE_DELETE',
      'department_requests:READ_WRITE_DELETE',
      'departments:READ_WRITE_DELETE',
      'users:READ_WRITE_DELETE',
    ],
  })
  permissions: string[];

  @ApiResponseProperty({
    example: '9dcf380d-a58b-4f35-8870-9948af717cb8',
  })
  facilityId: string;

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
