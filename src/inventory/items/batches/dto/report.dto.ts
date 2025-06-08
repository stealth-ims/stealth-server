import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { addDays } from 'date-fns';

export class FetchStockLevelReportDataQueryDto {
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
