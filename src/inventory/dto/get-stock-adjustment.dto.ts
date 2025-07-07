import {
  ApiPropertyOptional,
  ApiResponseProperty,
  IntersectionType,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { GenericResponseDto } from 'src/core/shared/dto/base.dto';
import { CreateStockAdjustmentDto } from '.';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationRequestDto } from 'src/core/shared/dto/pagination.dto';
import {
  StockAdjustmentStatus,
  StockAdjustmentType,
} from '../models/stock-adjustment.model';
import { ExportQueryDto } from '../../exports/dto';

export class OneStockAdjustment extends IntersectionType(
  PickType(CreateStockAdjustmentDto, [
    'quantity',
    'type',
    'reason',
    'notes',
    'status',
    'createdBy',
  ]),
  PickType(GenericResponseDto, ['id', 'createdAt']),
) {
  @ApiResponseProperty({
    example: {
      id: '016357ee-4569-4237-858a-970bf4ff8434',
      name: 'Some Item',
    },
  })
  item: object;

  @ApiResponseProperty({
    example: {
      id: 'd768435ef-81f1-4fbf-9923-a9618a7e8905',
      batchNumber: 'BATCH1097',
    },
  })
  batch: object;
}

export class StockAdjustmentPaginationDto extends IntersectionType(
  PaginationRequestDto,
) {
  @IsOptional()
  @IsUUID()
  facilityId: string;

  @IsOptional()
  @IsUUID()
  departmentId: string;

  @IsOptional()
  @IsEnum(StockAdjustmentType)
  @ApiPropertyOptional({
    enum: StockAdjustmentType,
    description: 'Type of stock adjustment',
  })
  type?: StockAdjustmentType;

  @IsOptional()
  @IsEnum(StockAdjustmentStatus)
  @ApiPropertyOptional({
    enum: StockAdjustmentStatus,
    description: 'Status of stock adjustment',
  })
  status?: StockAdjustmentStatus;

  @ApiPropertyOptional({
    type: Date,
    example: new Date(),
    description: 'Start date for filtering',
  })
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: new Date(),
    description: 'End date for filtering',
  })
  @IsOptional()
  endDate?: Date;

  @IsUUID()
  @IsOptional()
  createdBy: string;
}

export class ExportStockAdjustmentsQueryDto extends IntersectionType(
  ExportQueryDto,
  OmitType(StockAdjustmentPaginationDto, ['page', 'pageSize']),
) {}
