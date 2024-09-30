import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsString,
} from 'class-validator';
import { OrderStatus } from 'src/shared/enums/drugOrder.enum';

export class GetOrdersDto {
  @ApiPropertyOptional({
    description: 'The status of the order',
    example: 'Cancelled',
    enum: OrderStatus,
    default: OrderStatus.DRAFT,
    required: false,
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'The status of the order',
    example: 'Cancelled',
    enum: OrderStatus,
    default: OrderStatus.DRAFT,
  })
  @IsString()
  @IsOptional()
  supplier?: string;

  @ApiPropertyOptional({
    description: 'The name of the drug',
    example: 'Tramadol',
  })
  @IsString()
  @IsOptional()
  drugName?: string;

  @ApiPropertyOptional({
    description: 'The date to start fetching orders',
    example: '2024-09-13T15:07:15.716764',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'The date at which to end fetching orders',
    example: '2024-09-13T15:07:15.716764',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    description: 'The number of orders to fetch',
    example: 50,
  })
  @IsInt()
  @Min(1)
  @Max(200)
  limit: number = 15;
}
