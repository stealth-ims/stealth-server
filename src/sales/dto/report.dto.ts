import {
  ApiPropertyOptional,
  ApiResponseProperty,
  IntersectionType,
  PickType,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { addDays } from 'date-fns';
import { PaginationRequestDto } from '../../core/shared/dto/pagination.dto';
import { ExportQueryDto } from '../../exports/dto';

export class FetchSalesReportDataQueryDto extends PickType(
  PaginationRequestDto,
  ['dateRange'],
) {
  @ApiPropertyOptional({
    example: new Date(),
  })
  @IsOptional()
  @Type(() => Date)
  startDate: Date;

  @ApiPropertyOptional({ example: addDays(new Date(), 1) })
  @IsOptional()
  @Type(() => Date)
  endDate: Date;

  @ApiPropertyOptional({
    description: 'The specific date of data to be queried for the report',
    example: new Date(),
  })
  @IsOptional()
  @Type(() => Date)
  specificDate: Date;
}

export class FetchTopSellingReportDataQueryDto extends FetchSalesReportDataQueryDto {
  @ApiPropertyOptional({
    description: 'The limit for which data should be sent',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  limit: number;
}

export class ExportPeriodicSalesQueryDto extends IntersectionType(
  ExportQueryDto,
  FetchSalesReportDataQueryDto,
) {
  @ApiPropertyOptional({
    description: 'name of the periodic report to export',
    example: 'periodic_sale_2025',
  })
  @IsOptional()
  @IsString()
  fileName: string;
}

export class CreatedByDto {
  @ApiResponseProperty({ example: '79aea716-1b37-4411-9725-8322a0bfdf2d' })
  id: string;

  @ApiResponseProperty({ example: 'Jack Frost' })
  fullName: string;
}

export class SaleItemsDto {
  @ApiResponseProperty({ example: 'Analgesics Item 2' })
  itemName: string;

  @ApiResponseProperty({ example: 200 })
  totalQuantity: number;

  @ApiResponseProperty({ example: 1 })
  remainderItems: number;
}

export class RowDto {
  @ApiResponseProperty({ example: 16088.99 })
  total: number;

  @ApiResponseProperty({ example: 'PAID' })
  status: string;

  @ApiResponseProperty({ example: '2025-06-21T09:59:48.996+00:00' })
  createdAt: string;

  @ApiResponseProperty({ type: CreatedByDto })
  createdBy: CreatedByDto;

  @ApiResponseProperty({ type: SaleItemsDto })
  saleItems: SaleItemsDto;
}

export class AnalyticsMetricsDto<T> {
  @ApiResponseProperty()
  data: T;

  @ApiResponseProperty({ example: 'INCREASED' })
  changeType: string;

  @ApiResponseProperty({ example: null })
  percentageChange: number | null;
}

export class AnalyticsDto {
  @ApiResponseProperty({ type: AnalyticsMetricsDto<number> })
  totalItems: AnalyticsMetricsDto<number>;

  @ApiResponseProperty({ example: 21 })
  totalSales: number;

  @ApiResponseProperty({ type: AnalyticsMetricsDto<number> })
  totalRevenue: AnalyticsMetricsDto<number>;
}

export class SalesReportResponseDto {
  @ApiResponseProperty({ type: [RowDto] })
  rows: RowDto[];

  @ApiResponseProperty({ type: AnalyticsDto })
  analytics: AnalyticsDto;
}
