import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { GenericResponseDto } from 'src/shared/docs/dto/base.dto';
import { CreateStockAdjustmentDto } from '.';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';
import { StockAdjustmentStatus, StockAdjustmentType } from '../model';

export class OneStockAdjustment extends IntersectionType(
  CreateStockAdjustmentDto,
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

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional()
  createdBy: string;

  @ApiPropertyOptional({ type: Date, description: 'Start date for filtering' })
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ type: Date, description: 'End date for filtering' })
  @IsOptional()
  endDate?: Date;
}
