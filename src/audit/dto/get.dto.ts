import {
  ApiPropertyOptional,
  IntersectionType,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { PaginationRequestDto } from '../../core/shared/dto/pagination.dto';
import { AuditLogDto, DataTables } from './model.dto';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ExportQueryDto } from '../../exports/dto';

export class FindAuditLogQueryDto extends IntersectionType(
  PickType(AuditLogDto, [
    'action',
    'description',
    'userId',
    'startDate',
    'endDate',
  ]),
  OmitType(PaginationRequestDto, ['dateRange', 'search', 'searchFields']),
) {
  @ApiPropertyOptional({
    description: 'Name of the table affected',
    isArray: true,
    enum: DataTables,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(DataTables, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  tableNames: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departmentId?: string;

  facilityId?: string;

  userDepartmentId?: string;
}

export class FindAuditLogSuperAdminQueryDto extends OmitType(
  FindAuditLogQueryDto,
  ['facilityId', 'userDepartmentId'],
) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  facilityId?: string;
}

export class ExportAuditsQueryDto extends IntersectionType(
  ExportQueryDto,
  OmitType(FindAuditLogQueryDto, ['page', 'pageSize']),
) {}

export class AuditLogsResponseDto extends PickType(AuditLogDto, [
  'id',
  'userId',
  'user',
  'action',
  'tableName',
  'description',
  'recordId',
  'departmentId',
  'department',
  'facilityId',
  'facility',
  'createdAt',
  'updatedAt',
]) {}
export class AuditLogResponseDto extends OmitType(AuditLogDto, [
  'ipAddress',
  'userAgent',
  'context',
  'correlationId',
  'method',
  'requestUrl',
  'source',
  'statusCode',
]) {}
