import { Department } from './../models/department.model';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { GenericResponseDto } from 'src/shared/docs/dto/base.dto';
import { PaginationRequestDto } from '../../../shared/docs/dto/pagination.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class DepartmentResponse extends IntersectionType(
  Department,
  GenericResponseDto,
) {}

export class DepartmentPaginationRequestDto extends PaginationRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  facilityId: string;
}
