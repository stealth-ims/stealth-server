import {
  ApiPropertyOptional,
  IntersectionType,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { GenericResponseDto } from 'src/shared/docs/dto/base.dto';
import { CreateStockAdjustmentDto } from '.';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';
import {
  StockAdjustment,
  StockAdjustmentStatus,
  StockAdjustmentType,
} from '../model';

export class OneStockAdjustment extends IntersectionType(
  OmitType(CreateStockAdjustmentDto, ['batch']),
  PickType(StockAdjustment, ['status']),
  GenericResponseDto,
) {}

export class StockAdjustmentPaginationDto extends IntersectionType(
  PaginationRequestDto,
) {
  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional()
  facilityId: string;

  @IsUUID()
  @ApiPropertyOptional()
  @IsOptional()
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
  endDate?: Date;

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional()
  createdBy: string;
}
