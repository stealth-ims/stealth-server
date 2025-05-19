import {
  ApiPropertyOptional,
  ApiResponseProperty,
  PickType,
} from '@nestjs/swagger';
import { CreateUserDto } from '../../user/dto';
import { Department } from '../department/models/department.model';
import { PaginationRequestDto } from '../../core/shared/docs/dto/pagination.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AccountState } from '../../auth/models/user.model';

export class GetAdminUserDto extends PickType(CreateUserDto, [
  'fullName',
  'role',
  'status',
]) {
  @ApiResponseProperty({
    example: {
      id: '44220956-0962-4dd0-9e65-1564c585563c',
      name: 'Department A',
    },
  })
  department: Department;
}

export class FindUserQueryDto extends PaginationRequestDto {
  @ApiPropertyOptional({
    enum: AccountState,
  })
  @IsOptional()
  @IsEnum(AccountState)
  status: AccountState;

  @ApiPropertyOptional({
    example: 'Pharmacist',
    enum: ['Pharmacist', 'Central Admin', 'Department Admin'],
    description: 'Search for a user based on their role',
  })
  @IsOptional()
  @IsString()
  role: string;
}
