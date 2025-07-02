import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateFacilityDto, IntervalUnit } from './create.dto';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateFacilityDto extends PartialType(CreateFacilityDto) {}
export class UpdateExpiryIntervalDto {
  @ApiPropertyOptional({
    example: 60,
    description: 'The quantity for the interval',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  intervalQuantity?: number;

  @ApiPropertyOptional({
    example: 'days',
    enum: IntervalUnit,
    description: 'The unit of the interval',
  })
  @IsOptional()
  @IsEnum(IntervalUnit)
  intervalUnit?: IntervalUnit;
}
