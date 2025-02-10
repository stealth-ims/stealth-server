import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { addDays } from 'date-fns';

export enum ReportCategories {
  STOCK_LEVEL_REPORT = 'stock_level_report',
  STOCK_MOVEMENT_REPORT = 'stock_movement_report',
  LOW_STOCK_REORDER_REPORT = 'low_stock_reorder_report',
  EXPIRY_REPORT = 'expiry_report',
  DAMAGE_LOSS_REPORT = 'damage_loss_report',
  INVENTORY_VALUATION_REPORT = 'inventory_valuation_report',
  PERIODIC_SALES_REPORT = 'periodic_sales_report',
}
export class CreateReportDto {
  @ApiProperty({
    description: 'The type of the report',
    example: 'periodic_sales_reports',
    enum: ReportCategories,
  })
  @IsNotEmpty()
  @IsEnum(ReportCategories)
  reportType: ReportCategories;

  @ApiProperty({ description: 'The name of the report', example: 'sales' })
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'The name of the exported report',
    example: 'sales_02_10_2025',
  })
  @IsOptional()
  nameInExport: string;

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
