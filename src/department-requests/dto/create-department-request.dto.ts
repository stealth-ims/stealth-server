import { ApiProperty, OmitType } from '@nestjs/swagger';
import { GetDepartmentRequestDto } from './get.dto';
import {
  DepartmentRequestStatus,
  DepartmentRequestStatusType,
} from '../models/department-requests.model';

export class CreateDepartmentRequestDto extends GetDepartmentRequestDto {}
export class UpdateDepartmentRequestDto extends OmitType(
  GetDepartmentRequestDto,
  ['id', 'requestId', 'status'],
) {
  @ApiProperty({
    example: 'PENDING',
    enum: DepartmentRequestStatus,
  })
  status: DepartmentRequestStatusType;
}
