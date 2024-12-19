import { ApiProperty, ApiResponseProperty, PartialType } from '@nestjs/swagger';
import { GetDepartmentRequestDto } from './get.dto';
import { DepartmentRequestStatus } from '../models/department-requests.model';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreateDepartmentRequestDto extends GetDepartmentRequestDto {
  @ApiResponseProperty({
    example: '34a7159b-94bc-40c3-a710-3aba911e9289',
  })
  facilityId: string;

  @ApiResponseProperty({
    example: null,
  })
  deletedAt: string | null;

  @ApiResponseProperty({
    example: null,
  })
  deletedBy: string | null;
}

export class UpdateDepartmentRequestDto extends PartialType(
  CreateDepartmentRequestDto,
) {}

export class UpdateRequestStatusDto {
  @ApiProperty({
    example: 'PENDING',
    enum: DepartmentRequestStatus,
  })
  @IsNotEmpty()
  @IsEnum(DepartmentRequestStatus)
  status: DepartmentRequestStatus;
}
