import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { subDays } from 'date-fns';
import { DateRange } from '../../core/shared/docs/dto/pagination.dto';

export class FindGeneralAnalyticsQueryDto {
  @ApiProperty({
    example: subDays(new Date(), 1),
  })
  @IsNotEmpty()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    example: new Date(),
  })
  @IsNotEmpty()
  @Type(() => Date)
  endDate: Date;
}

export class FindAnalyticsQueryDto {
  @ApiProperty({
    example: 'today',
    enum: DateRange,
  })
  @IsNotEmpty()
  @IsEnum(DateRange)
  dateRange: DateRange;
}
