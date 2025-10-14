import { ApiPropertyOptional, ApiResponseProperty } from '@nestjs/swagger';

import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { GenericResponseDto } from '../../core/shared/dto/base.dto';
import { GetNoPaginateDto } from '../../core/shared/dto/get-no_paginate.dto';
import { GetUsersNoPaginateDto } from '../../user/dto';
import { Type } from 'class-transformer';

export enum DataTables {
  DEPARTMENT = 'Department',
  USER = 'User',
  DEPARTMENT_REQUEST = 'DepartmentRequest',
  BATCH = 'Batch',
  ITEM = 'Item',
  MARKUP = 'Markup',
  ITEM_CATEGORY = 'ItemCategory',
  STOCK_ADJUSTMENT = 'StockAdjustment',
  SUPPLIER = 'Supplier',
  ITEM_ORDER = 'ItemOrder',
  PATIENT = 'Patient',
  REPORT = 'Report',
  SALE_ITEM = 'SaleItem',
  SALE = 'Sale',
}

export class AuditLogDto extends GenericResponseDto {
  @ApiPropertyOptional({
    description: 'Action performed',
    enum: ['CREATE', 'UPDATE', 'DELETE'],
  })
  @IsOptional()
  @IsEnum(['CREATE', 'UPDATE', 'DELETE'])
  action: 'CREATE' | 'UPDATE' | 'DELETE';

  @ApiPropertyOptional({
    description: 'Name of the table affected',
    enum: DataTables,
  })
  @IsOptional()
  @IsEnum(DataTables)
  tableName: string;

  @ApiPropertyOptional({
    description: 'Description of the action',
    example: 'Created SaleItem',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'ec38c1ce-0c5d-4f32-af3c-b5a2b7d4b55d',
  })
  @IsOptional()
  @IsUUID(4)
  userId?: string;

  @ApiResponseProperty({
    type: GetUsersNoPaginateDto,
  })
  user: GetUsersNoPaginateDto;

  @ApiPropertyOptional({
    type: Date,
    example: new Date(),
    description: 'Start date for filtering',
  })
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: new Date(),
    description: 'End date for filtering',
  })
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @ApiResponseProperty({ example: 'f1a2b3c4-d5e6-7890-abcd-1234567890ef' })
  facilityId?: string;

  @ApiResponseProperty({
    type: GetNoPaginateDto,
  })
  facility: GetNoPaginateDto;

  @ApiResponseProperty({ example: 'd1e2f3a4-b5c6-7890-abcd-0987654321fe' })
  departmentId?: string;

  @ApiResponseProperty({
    type: GetNoPaginateDto,
  })
  department: GetNoPaginateDto;

  @ApiResponseProperty({ example: 'bd0a0bb5-3f74-44ce-903a-44fc1f295e1e' })
  recordId?: string;

  @ApiResponseProperty({ example: { name: 'Old Name', status: 'inactive' } })
  before?: object;

  @ApiResponseProperty({ example: { name: 'New Name', status: 'active' } })
  after?: object;

  @ApiResponseProperty({ example: '192.168.1.1' })
  ipAddress?: string;

  @ApiResponseProperty({
    example: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  })
  userAgent?: string;

  @ApiResponseProperty({ example: 'web' })
  source?: string;

  @ApiResponseProperty({ example: '/api/v1/resource/123' })
  requestUrl?: string;

  @ApiResponseProperty({ example: 'PATCH' })
  method?: string;

  @ApiResponseProperty({ example: 'User updated profile' })
  context?: string;

  @ApiResponseProperty({ example: 200 })
  statusCode?: number;

  @ApiResponseProperty({ example: 'abc123efg456-hij789klm012' })
  correlationId?: string;
}
