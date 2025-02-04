import {
  ApiProperty,
  ApiPropertyOptional,
  ApiResponseProperty,
  IntersectionType,
} from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { GenericResponseDto } from '../../shared/docs/dto/base.dto';

export class CreateUserDto extends IntersectionType(GenericResponseDto) {
  @ApiProperty({
    example: 'Healthcare Worker',
    description: 'The role the user is being registered as',
  })
  @IsNotEmpty()
  role: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the user',
  })
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({
    example: '9dcf380d-a58b-4f35-8870-9948af717cb8',
    description: 'The department id the user is registering to',
  })
  @IsOptional()
  departmentId: string;

  @ApiProperty({
    example: 'example@email.com',
    description: 'The email of the user',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  // @ApiProperty({
  //   example: 'XT(v2EiTqQZ',
  //   description: 'The password for the user',
  // })
  // @IsNotEmpty()
  // @Matches(
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.,!@#$^&*()_-])[a-zA-Z\d.,!@#$^&*()_-]{8,32}$/gm,
  //   {
  //     message:
  //       'Password must be between 8 and 32 characters long with at least 1 special character and an uppercase character',
  //   },
  // )
  // password: string;

  @ApiProperty({
    example: [
      'items:READ',
      'item_categories:READ_WRITE',
      'stock_adjustment:READ_WRITE_DELETE',
      'item_orders:READ_WRITE_DELETE',
    ],
    description: 'The permissions assigned to a user',
  })
  @IsNotEmpty()
  @IsArray()
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

export class CreateSettingsDto {
  @ApiProperty({ example: true })
  emailDepartmentRequests: boolean;

  @ApiProperty({ example: true })
  emailItemLowStocks: boolean;

  @ApiProperty({ example: true })
  emailItemOutOfStock: boolean;
}
